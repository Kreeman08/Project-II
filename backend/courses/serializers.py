from rest_framework import serializers
from .models import Course, CoursePost, CoursePostReply, Enrollment


class CourseSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    enrollment_count = serializers.IntegerField(source='enrollments.count', read_only=True)

    course_code = serializers.CharField(read_only=True)

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
        read_only_fields = ['teacher', 'teacher_name', 'enrollment_count', 'created_at']

    def create(self, validated_data):
        validated_data.pop('course_code', None)
        return super().create(validated_data)


class EnrollmentSerializer(serializers.ModelSerializer):
    course_detail = CourseSerializer(source='course', read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_username = serializers.CharField(source='student.username', read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            'id',
            'student',
            'student_name',
            'student_username',
            'course',
            'course_detail',
            'enrolled_at',
        ]

        # student automatically comes from logged-in user
        read_only_fields = ['student', 'student_name', 'student_username']


class JoinCourseSerializer(serializers.Serializer):
    course_code = serializers.CharField(max_length=12)


class CoursePostReplySerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    author_username = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = CoursePostReply
        fields = [
            'id',
            'post',
            'author',
            'author_name',
            'author_username',
            'text',
            'created_at',
        ]
        read_only_fields = ['author', 'author_name', 'author_username', 'created_at']


class CoursePostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    author_username = serializers.CharField(source='author.username', read_only=True)
    replies = CoursePostReplySerializer(many=True, read_only=True)

    class Meta:
        model = CoursePost
        fields = [
            'id',
            'course',
            'author',
            'author_name',
            'author_username',
            'text',
            'file',
            'created_at',
            'replies',
        ]
        read_only_fields = ['author', 'author_name', 'author_username', 'created_at', 'replies']
