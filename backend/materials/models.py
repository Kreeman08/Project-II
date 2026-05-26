from django.db import models
from users.models import User
from courses.models import Course


class Material(models.Model):

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='materials'
    )

    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'teacher'}
    )

    title = models.CharField(max_length=255)

    file = models.FileField(upload_to='materials/', blank=True, null=True)

    link = models.URLField(blank=True, null=True)

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title