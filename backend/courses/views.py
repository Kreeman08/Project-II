from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q

from .models import Course, CoursePost, CoursePostReply, Enrollment
from .serializers import (
    CoursePostReplySerializer,
    CoursePostSerializer,
    CourseSerializer,
    EnrollmentSerializer,
    JoinCourseSerializer,
)


class CourseViewSet(viewsets.ModelViewSet):

    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Course.objects.all()
        return Course.objects.filter(
            Q(teacher=user) | Q(enrollments__student=user)
        ).distinct()

    def get_permissions(self):
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        if self.request.user.role != 'teacher':
            self.request.user.role = 'teacher'
            self.request.user.save(update_fields=['role'])
        serializer.save(teacher=self.request.user)


class EnrollmentViewSet(viewsets.ModelViewSet):

    serializer_class = EnrollmentSerializer

    def get_queryset(self):

        user = self.request.user

        if user.role != 'admin':
            return Enrollment.objects.filter(
                Q(student=user) | Q(course__teacher=user)
            ).distinct()

        return Enrollment.objects.all()

    def get_permissions(self):
        return [IsAuthenticated()]

    def perform_create(self, serializer):

        # Automatically assign logged-in student
        serializer.save(student=self.request.user)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def join(self, request):
        serializer = JoinCourseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        code = serializer.validated_data['course_code'].upper().strip()

        try:
            course = Course.objects.get(course_code=code)
        except Course.DoesNotExist:
            return Response({'detail': 'Invalid course code.'}, status=status.HTTP_404_NOT_FOUND)

        if course.teacher == request.user:
            return Response(
                {'detail': 'You are the teacher of this class.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        enrollment, created = Enrollment.objects.get_or_create(student=request.user, course=course)
        if not created:
            return Response({'detail': 'You are already enrolled in this course.'}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {
                'detail': 'Course joined successfully.',
                'enrollment': EnrollmentSerializer(enrollment).data,
                'course': CourseSerializer(course).data,
            },
            status=status.HTTP_201_CREATED,
        )


class CoursePostViewSet(viewsets.ModelViewSet):
    serializer_class = CoursePostSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return CoursePost.objects.all()

        return CoursePost.objects.filter(
            Q(course__teacher=user) | Q(course__enrollments__student=user)
        ).distinct()

    def get_permissions(self):
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        course = serializer.validated_data.get('course')
        is_member = course.teacher == self.request.user or Enrollment.objects.filter(
            course=course,
            student=self.request.user
        ).exists()
        if not is_member:
            from rest_framework import serializers
            raise serializers.ValidationError(
                {'course': 'You must be in this class to post.'}
            )
        serializer.save(author=self.request.user)


class CoursePostReplyViewSet(viewsets.ModelViewSet):
    serializer_class = CoursePostReplySerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return CoursePostReply.objects.all()

        return CoursePostReply.objects.filter(
            Q(post__course__teacher=user) | Q(post__course__enrollments__student=user)
        ).distinct()

    def get_permissions(self):
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        post = serializer.validated_data.get('post')
        is_member = post.course.teacher == self.request.user or Enrollment.objects.filter(
            course=post.course,
            student=self.request.user
        ).exists()
        if not is_member:
            from rest_framework import serializers
            raise serializers.ValidationError(
                {'post': 'You must be in this class to reply.'}
            )
        serializer.save(author=self.request.user)
