from rest_framework import serializers
from .models import Course, Enrollment


class CourseSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    enrollment_count = serializers.IntegerField(source='enrollments.count', read_only=True)

    class Meta:
        model = Course
        fields = [
            'id',
            'name',
            'description',
            'course_code',
            'teacher',
            'teacher_name',
            'enrollment_count',
            'created_at',
        ]
        read_only_fields = ['course_code', 'teacher', 'teacher_name', 'enrollment_count', 'created_at']


class EnrollmentSerializer(serializers.ModelSerializer):
    course_detail = CourseSerializer(source='course', read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            'id',
            'student',
            'course',
            'course_detail',
            'enrolled_at',
        ]

        # student automatically comes from logged-in user
        read_only_fields = ['student']


class JoinCourseSerializer(serializers.Serializer):
    course_code = serializers.CharField(max_length=12)
