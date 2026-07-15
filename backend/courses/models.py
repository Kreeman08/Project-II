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
    allow_student_comments = models.BooleanField(default=True)
    allow_student_file_sharing = models.BooleanField(default=True)
    enrollment_requires_approval = models.BooleanField(default=True)

    teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='courses',
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
    )

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='enrollments'
    )

    enrolled_at = models.DateTimeField(auto_now_add=True)
    can_comment = models.BooleanField(default=True)
    can_share_files = models.BooleanField(default=True)
    can_submit_assignments = models.BooleanField(default=True)

    class Meta:
        unique_together = ['student', 'course']

    def __str__(self):
        return f"{self.student.username} -> {self.course.name}"


class CoursePost(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='posts'
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='course_posts'
    )
    text = models.TextField()
    file = models.FileField(upload_to='course_posts/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.course.name} - {self.author.username}"


class CoursePostReply(models.Model):
    post = models.ForeignKey(
        CoursePost,
        on_delete=models.CASCADE,
        related_name='replies'
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='course_post_replies'
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Reply by {self.author.username}"


class Notification(models.Model):
    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='notifications',
        blank=True,
        null=True,
    )
    kind = models.CharField(max_length=50)
    message = models.CharField(max_length=500)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class LeaveRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='leave_requests')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leave_requests')
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_leave_requests')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.student.username} - {self.course.name} ({self.status})'


class LeaveCourseRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        DECLINED = 'declined', 'Declined'

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leave_course_requests')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='leave_course_requests')
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_leave_course_requests')
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['student', 'course'],
                condition=models.Q(status='pending'),
                name='one_pending_leave_course_request_per_student_course',
            )
        ]

    def __str__(self):
        return f'{self.student.username} leaving {self.course.name} ({self.status})'


class JoinCourseRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='join_course_requests')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='join_course_requests')
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_join_course_requests')
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['student', 'course'],
                condition=models.Q(status='pending'),
                name='one_pending_join_course_request_per_student_course',
            )
        ]

    def __str__(self):
        return f'{self.student.username} joining {self.course.name} ({self.status})'
