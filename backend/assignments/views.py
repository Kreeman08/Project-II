from rest_framework import viewsets
from rest_framework import serializers
from .models import Assignment, Submission
from .serializers import AssignmentSerializer, SubmissionSerializer
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from courses.models import Enrollment
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser



class AssignmentViewSet(viewsets.ModelViewSet):

    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser] 

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
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
        serializer.save(created_by=self.request.user)

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

        if user.role != 'admin':
            return Submission.objects.filter(
                Q(student=user) | Q(assignment__course__teacher=user)
            ).distinct()

        return Submission.objects.all()

    def get_permissions(self):
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        assignment = serializer.validated_data.get('assignment')
        user = self.request.user

        if assignment.course.teacher == user:
            raise serializers.ValidationError(
                {'assignment': 'Teachers cannot submit their own assignment.'}
            )

        if not Enrollment.objects.filter(course=assignment.course, student=user).exists():
            raise serializers.ValidationError(
                {'assignment': 'You are not enrolled in this class.'}
            )

        serializer.save(student=user)
