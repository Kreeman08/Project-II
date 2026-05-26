from rest_framework import serializers
from .models import Test, Question, Option, TestSubmission, Answer


class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = '__all__'


class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = '__all__'


class TestSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Test
        fields = '__all__'
        read_only_fields = ['created_by']


class TestSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestSubmission
        fields = '__all__'
        read_only_fields = ['student', 'marks']


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = '__all__'
