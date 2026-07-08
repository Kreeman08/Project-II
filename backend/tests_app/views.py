from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import serializers, status
from django.db.models import Q

from .models import Test, Question, Option, TestSubmission, Answer
from .serializers import *

from courses.models import Enrollment


# ================= TEST =================
class TestViewSet(viewsets.ModelViewSet):

    queryset = Test.objects.all()
    serializer_class = TestSerializer

    def get_permissions(self):
        return [IsAuthenticated()]

    def get_queryset(self):

        user = self.request.user

        if user.role == 'admin':
            return Test.objects.all()

        enrolled_courses = Enrollment.objects.filter(
            student=user
        ).values_list('course_id', flat=True)

        return Test.objects.filter(
            Q(course__teacher=user) | Q(course_id__in=enrolled_courses)
        ).distinct()

    def perform_create(self, serializer):
        course = serializer.validated_data.get('course')
        if course.teacher != self.request.user:
            raise serializers.ValidationError(
                {'course': 'Only the class teacher can create tests.'}
            )
        if self.request.user.role != 'teacher':
            self.request.user.role = 'teacher'
            self.request.user.save(update_fields=['role'])
        serializer.save(created_by=self.request.user)


# ================= QUESTION =================
class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

    def get_permissions(self):
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        test = serializer.validated_data.get('test')
        if test.course.teacher != self.request.user:
            raise serializers.ValidationError(
                {'test': 'Only the class teacher can add questions.'}
            )
        serializer.save()


# ================= OPTION =================
class OptionViewSet(viewsets.ModelViewSet):
    queryset = Option.objects.all()
    serializer_class = OptionSerializer

    def get_permissions(self):
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        question = serializer.validated_data.get('question')
        if question.test.course.teacher != self.request.user:
            raise serializers.ValidationError(
                {'question': 'Only the class teacher can add options.'}
            )
        serializer.save()


# ================= SUBMISSION (AUTO GRADING) =================
class TestSubmissionViewSet(viewsets.ModelViewSet):

    queryset = TestSubmission.objects.all()
    serializer_class = TestSubmissionSerializer

    def get_permissions(self):
        return [IsAuthenticated()]

    def get_queryset(self):

        user = self.request.user

        if user.role != 'admin':
            return TestSubmission.objects.filter(
                Q(student=user) | Q(test__course__teacher=user)
            ).distinct()

        return TestSubmission.objects.all()

    def perform_create(self, serializer):

        user = self.request.user
        test_id = self.request.data.get("test")

        # validate test exists
        try:
            test = Test.objects.get(id=test_id)
        except Test.DoesNotExist:
            raise serializers.ValidationError({"test": "Test not found"})

        # 🔐 ENROLLMENT CHECK
        is_enrolled = Enrollment.objects.filter(
            student=user,
            course=test.course
        ).exists()

        if not is_enrolled:
            raise serializers.ValidationError(
                {"test": "You are not enrolled in this course"}
            )

        submission = serializer.save(student=user)

        answers_data = self.request.data.get("answers", [])

        total_marks = 0

        for ans in answers_data:

            question_id = ans.get("question")
            selected_option_id = ans.get("selected_option")

            if not question_id or not selected_option_id:
                continue

            # get correct option
            correct_option = Option.objects.filter(
                question_id=question_id,
                is_correct=True
            ).first()

            # scoring (+1 logic)
            if correct_option and correct_option.id == selected_option_id:
                total_marks += 1

            # save answer
            Answer.objects.create(
                submission=submission,
                question_id=question_id,
                selected_option_id=selected_option_id
            )

        submission.marks = total_marks
        submission.save()


    # ================= RESULT API =================
    @action(detail=True, methods=['get'])
    def result(self, request, pk=None):

        submission = self.get_object()

        # 🔐 SECURITY: only owner or teacher/admin
        if request.user.role == 'student' and submission.student != request.user:
            return Response(
                {"error": "Not allowed"},
                status=status.HTTP_403_FORBIDDEN
            )

        answers = Answer.objects.filter(submission=submission)

        result_data = []

        for ans in answers:

            correct_option = Option.objects.filter(
                question=ans.question,
                is_correct=True
            ).first()

            result_data.append({
                "question": ans.question.text,
                "selected": ans.selected_option.text if ans.selected_option else None,
                "correct": correct_option.text if correct_option else None,
                "is_correct": (
                    ans.selected_option_id == correct_option.id
                    if correct_option else False
                )
            })

        return Response({
            "test": submission.test.title,
            "student": submission.student.username,
            "marks": submission.marks,
            "total_questions": answers.count(),
            "answers": result_data
        })


# ================= ANSWER =================
class AnswerViewSet(viewsets.ModelViewSet):

    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer

    def get_permissions(self):
        return [IsAuthenticated()]
