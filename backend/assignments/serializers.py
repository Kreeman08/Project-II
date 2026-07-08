from rest_framework import serializers
from .models import Assignment, Submission


from rest_framework import serializers
from .models import Assignment


class AssignmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Assignment
        fields = [
            'id',
            'course',
            'title',
            'description',
            'reference_text',  
            'reference_file',
            'deadline',
            'created_by',
            'created_at',
        ]
        read_only_fields = ['created_by', 'created_at']

from rest_framework import serializers
from .models import Submission


class SubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_username = serializers.CharField(source='student.username', read_only=True)

    class Meta:
        model = Submission
        fields = [
            'id',
            'assignment',
            'student',
            'student_name',
            'student_username',
            'file',
            'text',
            'submitted_at',
            'marks',
        ]
        read_only_fields = [
            'student',
            'student_name',
            'student_username',
            'marks',
            'submitted_at'
        ]
