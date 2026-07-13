from rest_framework import serializers
from .models import Course, CoursePost, CoursePostReply, Enrollment, LeaveCourseRequest, LeaveRequest, Notification


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
            'allow_student_comments',
            'allow_student_file_sharing',
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
    student_email = serializers.EmailField(source='student.email', read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            'id',
            'student',
            'student_name',
            'student_username',
            'student_email',
            'course',
            'course_detail',
            'enrolled_at',
            'can_comment',
            'can_share_files',
            'can_submit_assignments',
        ]

        # student automatically comes from logged-in user
        read_only_fields = ['student', 'student_name', 'student_username', 'student_email', 'course_detail', 'enrolled_at']

    def validate(self, attrs):
        if self.instance and 'course' in attrs and attrs['course'] != self.instance.course:
            raise serializers.ValidationError({'course': 'An enrollment cannot be moved to another course.'})
        return attrs


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


class NotificationSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'course', 'course_name', 'kind', 'message', 'is_read', 'created_at']
        read_only_fields = ['course', 'course_name', 'kind', 'message', 'created_at']


class LeaveRequestSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_email = serializers.EmailField(source='student.email', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True)

    class Meta:
        model = LeaveRequest
        fields = [
            'id', 'course', 'course_name', 'student', 'student_name', 'student_email',
            'start_date', 'end_date', 'reason', 'status', 'reviewed_by',
            'reviewed_by_name', 'reviewed_at', 'created_at',
        ]
        read_only_fields = [
            'student', 'student_name', 'student_email', 'status', 'reviewed_by',
            'reviewed_by_name', 'reviewed_at', 'created_at',
        ]

    def validate(self, attrs):
        start = attrs.get('start_date', getattr(self.instance, 'start_date', None))
        end = attrs.get('end_date', getattr(self.instance, 'end_date', None))
        if start and end and end < start:
            raise serializers.ValidationError({'end_date': 'End date cannot be before the start date.'})
        if not (attrs.get('reason') or getattr(self.instance, 'reason', '')).strip():
            raise serializers.ValidationError({'reason': 'Please provide a reason for the leave request.'})
        return attrs


class LeaveCourseRequestSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_email = serializers.EmailField(source='student.email', read_only=True)
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)

    class Meta:
        model = LeaveCourseRequest
        fields = [
            'id', 'student', 'student_name', 'student_email', 'course', 'course_name',
            'teacher', 'teacher_name', 'status', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'student', 'student_name', 'student_email', 'teacher', 'teacher_name',
            'status', 'created_at', 'updated_at',
        ]
