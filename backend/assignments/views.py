from rest_framework import viewsets
from rest_framework import serializers
from .models import Assignment, Submission
from .serializers import AssignmentSerializer, SubmissionSerializer
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from courses.models import Enrollment, Notification
from courses.notifications import display_name
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser



class AssignmentViewSet(viewsets.ModelViewSet):

    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser] 

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Assignment.objects.all()

        return Assignment.objects.filter(
            Q(course__teacher=user) | Q(course__enrollments__student=user)
        ).distinct()

    def get_permissions(self):
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        course = serializer.validated_data.get('course')
        if course.teacher != self.request.user:
            raise serializers.ValidationError(
                {'course': 'Only the class teacher can create assignments.'}
            )
        assignment = serializer.save(created_by=self.request.user)
        Notification.objects.bulk_create([
            Notification(
                recipient=enrollment.student,
                course=course,
                kind='assignment_added',
                message=f'New assignment in {course.name}: {assignment.title}.',
            )
            for enrollment in Enrollment.objects.filter(course=course).select_related('student')
        ])

    def perform_update(self, serializer):
        assignment = self.get_object()
        if assignment.course.teacher != self.request.user:
            raise serializers.ValidationError(
                {'course': 'Only the class teacher can edit assignments.'}
            )
        serializer.save()

    def perform_destroy(self, instance):
        if instance.course.teacher != self.request.user:
            raise serializers.ValidationError(
                {'course': 'Only the class teacher can delete assignments.'}
            )
        instance.delete()

class SubmissionViewSet(viewsets.ModelViewSet):

    serializer_class = SubmissionSerializer

    def get_queryset(self):

        user = self.request.user

        if user.is_superuser:
            return Submission.objects.all()
        return Submission.objects.filter(Q(student=user) | Q(assignment__course__teacher=user)).distinct()

    def get_permissions(self):
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        assignment = serializer.validated_data.get('assignment')
        user = self.request.user

        if assignment.course.teacher == user:
            raise serializers.ValidationError(
                {'assignment': 'Teachers cannot submit their own assignment.'}
            )

        enrollment = Enrollment.objects.filter(course=assignment.course, student=user).first()
        if not enrollment:
            raise serializers.ValidationError(
                {'assignment': 'You are not enrolled in this class.'}
            )
        if not enrollment.can_submit_assignments:
            raise serializers.ValidationError({'assignment': 'Your assignment submission permission is disabled for this class.'})

        submission = serializer.save(student=user)
        Notification.objects.create(
            recipient=assignment.course.teacher,
            course=assignment.course,
            kind='assignment_submitted',
            message=f'{display_name(user)} submitted {assignment.title}.',
        )
