import random
import string

from django.db import models
from users.models import User


def generate_course_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


class Course(models.Model):

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    course_code = models.CharField(max_length=12, unique=True, blank=True)

    teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='courses',
        limit_choices_to={'role': 'teacher'}
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.course_code:
            code = generate_course_code()
            while Course.objects.filter(course_code=code).exists():
                code = generate_course_code()
            self.course_code = code
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Enrollment(models.Model):

    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='enrollments',
        limit_choices_to={'role': 'student'}
    )

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='enrollments'
    )

    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['student', 'course']

    def __str__(self):
        return f"{self.student.username} -> {self.course.name}"
