from rest_framework import serializers
from django.utils import timezone

from .models import Answer, Option, Question, Test, TestSubmission


def test_structure_errors(test):
    """Return publication errors for a test's MCQ structure."""
    questions = list(test.questions.prefetch_related('options'))
    if not questions:
        return ['A test must contain at least one question.']

    errors = []
    for position, question in enumerate(questions, start=1):
        options = list(question.options.all())
        correct_count = sum(option.is_correct for option in options)
        if len(options) != 4 or correct_count != 1:
            errors.append(
                f'Question {position} must have exactly four choices and one correct choice.'
            )
    return errors


class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'question', 'text', 'is_correct']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request and request.user.is_authenticated and instance.question.test.course.teacher_id != request.user.id:
            data.pop('is_correct', None)
        return data


class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'test', 'text', 'options']


class TestSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    question_count = serializers.SerializerMethodField()

    class Meta:
        model = Test
        fields = [
            'id', 'course', 'title', 'description', 'published', 'timer_enabled',
            'time_limit_minutes', 'deadline', 'created_by',
            'created_at', 'questions', 'question_count',
        ]
        read_only_fields = ['created_by', 'created_at', 'questions', 'question_count']

    def get_question_count(self, obj):
        return obj.questions.count()

    def validate(self, attrs):
        instance = getattr(self, 'instance', None)
        if instance and 'course' in attrs and attrs['course'] != instance.course:
            raise serializers.ValidationError({'course': 'A test cannot be moved to another course.'})
        is_being_published = attrs.get('published') is True and not (
            instance and instance.published
        )
        if is_being_published:
            if not instance:
                raise serializers.ValidationError(
                    {'published': 'Create the test and its questions before publishing it.'}
                )
            errors = test_structure_errors(instance)
            if errors:
                raise serializers.ValidationError({'published': errors})
            deadline = attrs.get('deadline', instance.deadline if instance else None)
            if deadline and deadline <= timezone.now():
                raise serializers.ValidationError(
                    {'deadline': 'Set a deadline that is in the future before publishing.'}
                )
        timer_enabled = attrs.get(
            'timer_enabled', instance.timer_enabled if instance else False
        )
        time_limit = attrs.get(
            'time_limit_minutes', instance.time_limit_minutes if instance else None
        )
        if timer_enabled and not time_limit:
            raise serializers.ValidationError(
                {'time_limit_minutes': 'Set a time limit when the timer is enabled.'}
            )
        if not timer_enabled:
            attrs['time_limit_minutes'] = None
        return attrs


class TestSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_username = serializers.CharField(source='student.username', read_only=True)

    def get_student_name(self, obj):
        return obj.student.get_full_name() or obj.student.username

    class Meta:
        model = TestSubmission
        fields = [
            'id', 'test', 'student', 'student_name', 'student_username', 'marks',
            'submitted_at',
        ]
        read_only_fields = [
            'student', 'student_name', 'student_username', 'marks', 'submitted_at',
        ]


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'submission', 'question', 'selected_option']
