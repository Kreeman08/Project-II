from django.db import models
from users.models import User
from courses.models import Course


class Assignment(models.Model):

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='assignments'
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    deadline = models.DateTimeField()

    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'teacher'}
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Submission(models.Model):

    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.CASCADE,
        related_name='submissions'
    )

    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'student'}
    )

    file = models.FileField(upload_to='submissions/', blank=True, null=True)

    text = models.TextField(blank=True)

    submitted_at = models.DateTimeField(auto_now_add=True)

    marks = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.student.username} - {self.assignment.title}"