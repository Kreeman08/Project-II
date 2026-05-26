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
            'deadline',
            'created_by',
            'created_at',
        ]
        read_only_fields = ['created_by', 'created_at']

from rest_framework import serializers
from .models import Submission


class SubmissionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Submission
        fields = [
            'id',
            'assignment',
            'student',
            'file',
            'text',
            'submitted_at',
            'marks',
        ]
        read_only_fields = [
            'student',
            'marks',
            'submitted_at'
        ]