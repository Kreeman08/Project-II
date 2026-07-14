from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework import serializers, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from courses.models import Enrollment, Notification
from courses.notifications import display_name
from .models import Answer, Option, Question, Test, TestSubmission
from .serializers import (
    AnswerSerializer,
    OptionSerializer,
    QuestionSerializer,
    TestSerializer,
    TestSubmissionSerializer,
)


def ensure_course_owner(user, course):
    if course.teacher_id != user.id:
        raise PermissionDenied('Only the teacher who owns this course can manage its tests.')


def ensure_editable(test):
    if test.published:
        raise serializers.ValidationError(
            {'detail': 'Unpublish this test before changing its questions or choices.'}
        )


class TestViewSet(viewsets.ModelViewSet):
    serializer_class = TestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Test.objects.filter(
            Q(course__teacher=user) | Q(published=True, course__enrollments__student=user),
        ).prefetch_related('questions__options').distinct()

    def perform_create(self, serializer):
        course = serializer.validated_data['course']
        ensure_course_owner(self.request.user, course)
        serializer.save(created_by=self.request.user, published=False)

    def perform_update(self, serializer):
        ensure_course_owner(self.request.user, serializer.instance.course)
        was_published = serializer.instance.published
        test = serializer.save()
        if not was_published and test.published:
            Notification.objects.bulk_create([
                Notification(
                    recipient=enrollment.student,
                    course=test.course,
                    kind='test_added',
                    message=f'New test in {test.course.name}: {test.title}.',
                )
                for enrollment in Enrollment.objects.filter(course=test.course).select_related('student')
            ])

    def perform_destroy(self, instance):
        ensure_course_owner(self.request.user, instance.course)
        instance.delete()


class QuestionViewSet(viewsets.ModelViewSet):
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Question.objects.filter(
            test__course__teacher=self.request.user,
        ).prefetch_related('options')

    def perform_create(self, serializer):
        test = serializer.validated_data['test']
        ensure_course_owner(self.request.user, test.course)
        ensure_editable(test)
        serializer.save()

    def perform_update(self, serializer):
        ensure_course_owner(self.request.user, serializer.instance.test.course)
        ensure_editable(serializer.instance.test)
        serializer.save()

    def perform_destroy(self, instance):
        ensure_course_owner(self.request.user, instance.test.course)
        ensure_editable(instance.test)
        instance.delete()


class OptionViewSet(viewsets.ModelViewSet):
    serializer_class = OptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Option.objects.filter(
            question__test__course__teacher=self.request.user,
        )

    def perform_create(self, serializer):
        question = serializer.validated_data['question']
        ensure_course_owner(self.request.user, question.test.course)
        ensure_editable(question.test)
        serializer.save()

    def perform_update(self, serializer):
        ensure_course_owner(self.request.user, serializer.instance.question.test.course)
        ensure_editable(serializer.instance.question.test)
        serializer.save()

    def perform_destroy(self, instance):
        ensure_course_owner(self.request.user, instance.question.test.course)
        ensure_editable(instance.question.test)
        instance.delete()


class TestSubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = TestSubmissionSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        return TestSubmission.objects.filter(
            Q(student=user) | Q(test__course__teacher=user)
        ).select_related('student', 'test').distinct()

    def perform_create(self, serializer):
        user = self.request.user
        test = serializer.validated_data['test']
        if test.course.teacher_id == user.id:
            raise PermissionDenied('Course teachers cannot submit their own tests.')
        if not test.published:
            raise serializers.ValidationError({'test': 'This test is not published.'})
        if test.deadline and timezone.now() > test.deadline:
            raise serializers.ValidationError({'test': 'The deadline for this test has passed.'})
        if not Enrollment.objects.filter(student=user, course=test.course).exists():
            raise serializers.ValidationError({'test': 'You are not enrolled in this course.'})
        if TestSubmission.objects.filter(student=user, test=test).exists():
            raise serializers.ValidationError({'test': 'You have already submitted this test.'})

        answers_data = self.request.data.get('answers')
        if not isinstance(answers_data, list):
            raise serializers.ValidationError({'answers': 'Submit one answer for every question.'})

        questions = list(test.questions.prefetch_related('options'))
        question_ids = {question.id for question in questions}
        submitted_ids = [answer.get('question') for answer in answers_data]
        if len(submitted_ids) != len(set(submitted_ids)) or not set(submitted_ids).issubset(question_ids):
            raise serializers.ValidationError(
                {'answers': 'Each submitted answer must belong to this test and appear only once.'}
            )

        answers_to_create = []
        total_marks = 0
        questions_by_id = {question.id: question for question in questions}
        for answer_data in answers_data:
            question_id = answer_data.get('question')
            option_id = answer_data.get('selected_option')
            question = questions_by_id[question_id]
            option = next((item for item in question.options.all() if item.id == option_id), None)
            if option is None:
                raise serializers.ValidationError(
                    {'answers': f'Answer choice does not belong to question {question_id}.'}
                )
            answers_to_create.append((question, option))
            total_marks += int(option.is_correct)

        with transaction.atomic():
            submission = serializer.save(student=user, marks=total_marks)
            Answer.objects.bulk_create([
                Answer(submission=submission, question=question, selected_option=option)
                for question, option in answers_to_create
            ])
        Notification.objects.create(
            recipient=test.course.teacher,
            course=test.course,
            kind='test_submitted',
            message=f'{display_name(user)} submitted {test.title}.',
        )

    @action(detail=True, methods=['get'])
    def result(self, request, pk=None):
        submission = self.get_object()
        answers_by_question_id = {
            answer.question_id: answer
            for answer in submission.answers.select_related('question', 'selected_option')
        }
        questions = submission.test.questions.prefetch_related('options').order_by('id')
        result_data = []
        for question_number, question in enumerate(questions, start=1):
            answer = answers_by_question_id.get(question.id)
            selected_option = answer.selected_option if answer else None
            correct_option = next(
                (option for option in question.options.all() if option.is_correct),
                None,
            )
            is_correct = (
                selected_option is not None
                and selected_option.id == getattr(correct_option, 'id', None)
            )
            result_data.append({
                'question_number': question_number,
                'question_id': question.id,
                'question_text': question.text,
                'question': question.text,
                'student_answer': selected_option.text if selected_option else None,
                'selected': selected_option.text if selected_option else None,
                'correct': correct_option.text if correct_option else None,
                'correct_answer': correct_option.text if correct_option else None,
                'selected_option_id': selected_option.id if selected_option else None,
                'correct_option_id': correct_option.id if correct_option else None,
                'marks_obtained': 1 if is_correct else 0,
                'is_correct': is_correct,
            })
        return Response({
            'submission_id': submission.id,
            'test': submission.test.title,
            'test_id': submission.test_id,
            'student': submission.student.username,
            'student_name': submission.student.get_full_name() or submission.student.username,
            'marks': submission.marks,
            'total_marks': submission.test.questions.count(),
            'total_questions': submission.test.questions.count(),
            'answers': result_data,
        })


class AnswerViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AnswerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Answer.objects.filter(
            Q(submission__student=user) | Q(submission__test__course__teacher=user)
        ).distinct()
