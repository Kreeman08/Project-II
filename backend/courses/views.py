from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Course, Enrollment
from .serializers import CourseSerializer, EnrollmentSerializer, JoinCourseSerializer

from users.permissions import IsStudent, IsTeacher


class CourseViewSet(viewsets.ModelViewSet):

    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Course.objects.all()
        if user.role == 'teacher':
            return Course.objects.filter(teacher=user)
        if user.role == 'student':
            return Course.objects.filter(enrollments__student=user)
        return Course.objects.none()

    def get_permissions(self):

        # Only teacher can create/update/delete courses
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsTeacher()]

        # Any logged-in user can view courses
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)


class EnrollmentViewSet(viewsets.ModelViewSet):

    serializer_class = EnrollmentSerializer

    def get_queryset(self):

        user = self.request.user

        # Student sees only own enrollments
        if user.role == 'student':
            return Enrollment.objects.filter(student=user)

        # Teacher/Admin can see all enrollments
        return Enrollment.objects.all()

    def get_permissions(self):

        # Only students can enroll
        if self.action == 'create':
            return [IsAuthenticated(), IsStudent()]

        return [IsAuthenticated()]

    def perform_create(self, serializer):

        # Automatically assign logged-in student
        serializer.save(student=self.request.user)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsStudent])
    def join(self, request):
        serializer = JoinCourseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        code = serializer.validated_data['course_code'].upper().strip()

        try:
            course = Course.objects.get(course_code=code)
        except Course.DoesNotExist:
            return Response({'detail': 'Invalid course code.'}, status=status.HTTP_404_NOT_FOUND)

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
