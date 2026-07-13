from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import IntegrityError, transaction
from django.db.models import Q
from django.utils import timezone

from .models import Course, CoursePost, CoursePostReply, Enrollment, LeaveCourseRequest, LeaveRequest, Notification
from .serializers import (
    CoursePostReplySerializer,
    CoursePostSerializer,
    CourseSerializer,
    EnrollmentSerializer,
    LeaveCourseRequestSerializer,
    JoinCourseSerializer,
    LeaveRequestSerializer,
    NotificationSerializer,
)
from .notifications import display_name, notify


class CourseViewSet(viewsets.ModelViewSet):

    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Course.objects.all()
        return Course.objects.filter(
            Q(teacher=user) | Q(enrollments__student=user)
        ).distinct()

    def get_permissions(self):
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.teacher_id != self.request.user.id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only the class teacher can change class settings.')
        permission_updates = {}
        if 'allow_student_comments' in serializer.validated_data:
            permission_updates['can_comment'] = serializer.validated_data['allow_student_comments']
        if 'allow_student_file_sharing' in serializer.validated_data:
            permission_updates['can_share_files'] = serializer.validated_data['allow_student_file_sharing']
        with transaction.atomic():
            course = serializer.save()
            if permission_updates:
                Enrollment.objects.filter(course=course).update(**permission_updates)

    def perform_destroy(self, instance):
        if instance.teacher_id != self.request.user.id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only the class teacher can delete this class.')
        instance.delete()


class EnrollmentViewSet(viewsets.ModelViewSet):

    serializer_class = EnrollmentSerializer

    def get_queryset(self):

        user = self.request.user

        if user.is_superuser:
            return Enrollment.objects.all()
        return Enrollment.objects.filter(Q(student=user) | Q(course__teacher=user)).distinct()

    def get_permissions(self):
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        course = serializer.validated_data['course']
        if course.teacher_id == self.request.user.id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only students can join a class.')
        enrollment = serializer.save(student=self.request.user)
        notify(course.teacher, course, 'student_joined', f'{display_name(self.request.user)} joined {course.name}.')

    def perform_update(self, serializer):
        if serializer.instance.course.teacher_id != self.request.user.id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only the class teacher can change student permissions.')
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if instance.student_id == user.id:
            notify(instance.course.teacher, instance.course, 'student_left', f'{display_name(user)} left {instance.course.name}.')
        elif instance.course.teacher_id == user.id:
            notify(instance.student, instance.course, 'student_removed', f'You were removed from {instance.course.name}.')
        else:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You cannot remove this student.')
        instance.delete()

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def join(self, request):
        serializer = JoinCourseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        code = serializer.validated_data['course_code'].upper().strip()

        try:
            course = Course.objects.get(course_code=code)
        except Course.DoesNotExist:
            return Response({'detail': 'Invalid course code.'}, status=status.HTTP_404_NOT_FOUND)

        if course.teacher == request.user:
            return Response(
                {'detail': 'You are the teacher of this class.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        enrollment, created = Enrollment.objects.get_or_create(student=request.user, course=course)
        if not created:
            return Response({'detail': 'You are already enrolled in this course.'}, status=status.HTTP_400_BAD_REQUEST)

        notify(course.teacher, course, 'student_joined', f'{display_name(request.user)} joined {course.name}.')
        return Response(
            {
                'detail': 'Course joined successfully.',
                'enrollment': EnrollmentSerializer(enrollment).data,
                'course': CourseSerializer(course).data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        enrollment = self.get_object()
        if enrollment.student_id != request.user.id:
            return Response({'detail': 'Only an enrolled student can leave this class.'}, status=status.HTTP_403_FORBIDDEN)
        notify(enrollment.course.teacher, enrollment.course, 'student_left', f'{display_name(request.user)} left {enrollment.course.name}.')
        enrollment.delete()
        return Response({'detail': 'You have left the class.'})

    @action(detail=True, methods=['post'], url_path='remove-student')
    def remove_student(self, request, pk=None):
        enrollment = self.get_object()
        if enrollment.course.teacher_id != request.user.id:
            return Response({'detail': 'Only the class teacher can remove students.'}, status=status.HTTP_403_FORBIDDEN)
        notify(enrollment.student, enrollment.course, 'student_removed', f'You were removed from {enrollment.course.name}.')
        enrollment.delete()
        return Response({'detail': 'Student removed from the class.'})


class CoursePostViewSet(viewsets.ModelViewSet):
    serializer_class = CoursePostSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return CoursePost.objects.all()

        return CoursePost.objects.filter(
            Q(course__teacher=user) | Q(course__enrollments__student=user)
        ).distinct()

    def get_permissions(self):
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        course = serializer.validated_data.get('course')
        enrollment = Enrollment.objects.filter(
            course=course,
            student=self.request.user
        ).first()
        is_member = course.teacher == self.request.user or enrollment is not None
        if not is_member:
            from rest_framework import serializers
            raise serializers.ValidationError(
                {'course': 'You must be in this class to post.'}
            )
        if course.teacher_id != self.request.user.id and (not course.allow_student_comments or not enrollment.can_comment):
            raise serializers.ValidationError({'detail': 'Student comments are disabled for this class.'})
        if serializer.validated_data.get('file') and course.teacher_id != self.request.user.id and (not course.allow_student_file_sharing or not enrollment.can_share_files):
            raise serializers.ValidationError({'file': 'Student file sharing is disabled for this class.'})
        text = serializer.validated_data.get('text', '').strip()
        if CoursePost.objects.filter(course=course, author=self.request.user, text=text).exists():
            raise serializers.ValidationError({'text': 'This comment has already been posted.'})
        has_file = bool(serializer.validated_data.get('file'))
        serializer.save(author=self.request.user)
        if course.teacher_id != self.request.user.id:
            event = 'file_uploaded' if has_file else 'comment_added'
            detail = 'uploaded a file' if event == 'file_uploaded' else 'added a comment'
            notify(course.teacher, course, event, f'{display_name(self.request.user)} {detail} in {course.name}.')

    def perform_update(self, serializer):
        post = serializer.instance
        if post.author_id != self.request.user.id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You can only edit your own post.')
        enrollment = Enrollment.objects.filter(course=post.course, student=self.request.user).first()
        if post.course.teacher_id != self.request.user.id and (not post.course.allow_student_comments or not enrollment or not enrollment.can_comment):
            raise serializers.ValidationError({'detail': 'Student comments are disabled for this class.'})
        if serializer.validated_data.get('file') and post.course.teacher_id != self.request.user.id and (not post.course.allow_student_file_sharing or not enrollment or not enrollment.can_share_files):
            raise serializers.ValidationError({'file': 'Student file sharing is disabled for this class.'})
        serializer.save()

    def perform_destroy(self, instance):
        if instance.author_id != self.request.user.id and instance.course.teacher_id != self.request.user.id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You can only delete your own post.')
        instance.delete()


class CoursePostReplyViewSet(viewsets.ModelViewSet):
    serializer_class = CoursePostReplySerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return CoursePostReply.objects.all()

        return CoursePostReply.objects.filter(
            Q(post__course__teacher=user) | Q(post__course__enrollments__student=user)
        ).distinct()

    def get_permissions(self):
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        post = serializer.validated_data.get('post')
        enrollment = Enrollment.objects.filter(
            course=post.course,
            student=self.request.user
        ).first()
        is_member = post.course.teacher == self.request.user or enrollment is not None
        if not is_member:
            from rest_framework import serializers
            raise serializers.ValidationError(
                {'post': 'You must be in this class to reply.'}
            )
        if post.course.teacher_id != self.request.user.id and (not post.course.allow_student_comments or not enrollment.can_comment):
            raise serializers.ValidationError({'detail': 'Student comments are disabled for this class.'})
        text = serializer.validated_data.get('text', '').strip()
        if CoursePostReply.objects.filter(post=post, author=self.request.user, text=text).exists():
            raise serializers.ValidationError({'text': 'This reply has already been posted.'})
        serializer.save(author=self.request.user)
        if post.course.teacher_id != self.request.user.id:
            notify(post.course.teacher, post.course, 'comment_added', f'{display_name(self.request.user)} commented in {post.course.name}.')

    def perform_update(self, serializer):
        reply = serializer.instance
        if reply.author_id != self.request.user.id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You can only edit your own reply.')
        enrollment = Enrollment.objects.filter(course=reply.post.course, student=self.request.user).first()
        if reply.post.course.teacher_id != self.request.user.id and (not reply.post.course.allow_student_comments or not enrollment or not enrollment.can_comment):
            raise serializers.ValidationError({'detail': 'Student comments are disabled for this class.'})
        serializer.save()

    def perform_destroy(self, instance):
        if instance.author_id != self.request.user.id and instance.post.course.teacher_id != self.request.user.id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You can only delete your own reply.')
        instance.delete()


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user).select_related('course')

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=['is_read'])
        return Response(NotificationSerializer(notification).data)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'detail': 'Notifications marked as read.'})


class LeaveRequestViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveRequestSerializer
    http_method_names = ['get', 'post', 'head', 'options']
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = LeaveRequest.objects.select_related('course', 'student', 'reviewed_by')
        if user.is_superuser:
            return queryset
        return queryset.filter(Q(course__teacher=user) | Q(student=user)).distinct()

    def perform_create(self, serializer):
        user = self.request.user
        course = serializer.validated_data['course']
        if course.teacher_id == user.id or not Enrollment.objects.filter(course=course, student=user).exists():
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only enrolled students can apply for leave.')
        leave_request = serializer.save(student=user)
        notify(course.teacher, course, 'leave_requested', f'{display_name(user)} requested leave from {leave_request.start_date} to {leave_request.end_date}.')

    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        leave_request = self.get_object()
        if not request.user.is_superuser and leave_request.course.teacher_id != request.user.id:
            return Response({'detail': 'Only the class teacher or an administrator can review leave requests.'}, status=status.HTTP_403_FORBIDDEN)
        next_status = request.data.get('status')
        if next_status not in [LeaveRequest.Status.APPROVED, LeaveRequest.Status.REJECTED]:
            return Response({'detail': 'Status must be approved or rejected.'}, status=status.HTTP_400_BAD_REQUEST)
        leave_request.status = next_status
        leave_request.reviewed_by = request.user
        leave_request.reviewed_at = timezone.now()
        leave_request.save(update_fields=['status', 'reviewed_by', 'reviewed_at'])
        notify(leave_request.student, leave_request.course, 'leave_reviewed', f'Your leave request for {leave_request.course.name} was {leave_request.get_status_display().lower()}.')
        return Response(self.get_serializer(leave_request).data)


class LeaveCourseRequestViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveCourseRequestSerializer
    http_method_names = ['get', 'post', 'head', 'options']
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = LeaveCourseRequest.objects.select_related('student', 'course', 'teacher')
        if user.is_superuser:
            queryset = queryset
        else:
            queryset = queryset.filter(Q(teacher=user) | Q(student=user)).distinct()
        course_id = self.request.query_params.get('course')
        return queryset.filter(course_id=course_id) if course_id else queryset

    def perform_create(self, serializer):
        user = self.request.user
        course = serializer.validated_data['course']
        if course.teacher_id == user.id or not Enrollment.objects.filter(course=course, student=user).exists():
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only enrolled students can request to leave this course.')
        if LeaveCourseRequest.objects.filter(student=user, course=course, status=LeaveCourseRequest.Status.PENDING).exists():
            raise serializers.ValidationError({'detail': 'You already have a pending leave request for this course.'})
        try:
            request = serializer.save(student=user, teacher=course.teacher)
        except IntegrityError:
            raise serializers.ValidationError({'detail': 'You already have a pending leave request for this course.'})
        notify(course.teacher, course, 'leave_course_requested', f'{display_name(user)} requested to leave {course.name}.')

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        leave_request = self.get_object()
        if leave_request.student_id != request.user.id:
            return Response({'detail': 'You can only cancel your own leave request.'}, status=status.HTTP_403_FORBIDDEN)
        if leave_request.status != LeaveCourseRequest.Status.PENDING:
            return Response({'detail': 'Only pending leave requests can be cancelled.'}, status=status.HTTP_400_BAD_REQUEST)
        leave_request.delete()
        return Response({'detail': 'Leave request cancelled.'})

    @action(detail=True, methods=['post'])
    def decide(self, request, pk=None):
        leave_request = self.get_object()
        if not request.user.is_superuser and leave_request.teacher_id != request.user.id:
            return Response({'detail': 'Only the assigned teacher can decide this leave request.'}, status=status.HTTP_403_FORBIDDEN)
        decision = request.data.get('status')
        if decision not in [LeaveCourseRequest.Status.APPROVED, LeaveCourseRequest.Status.DECLINED]:
            return Response({'detail': 'Status must be approved or declined.'}, status=status.HTTP_400_BAD_REQUEST)
        if leave_request.status != LeaveCourseRequest.Status.PENDING:
            return Response({'detail': 'This leave request has already been decided.'}, status=status.HTTP_400_BAD_REQUEST)
        with transaction.atomic():
            leave_request.status = decision
            leave_request.save(update_fields=['status', 'updated_at'])
            if decision == LeaveCourseRequest.Status.APPROVED:
                Enrollment.objects.filter(course=leave_request.course, student=leave_request.student).delete()
        message = f'Your request to leave {leave_request.course.name} was {leave_request.get_status_display().lower()}.'
        notify(leave_request.student, leave_request.course, 'leave_course_decided', message)
        return Response(self.get_serializer(leave_request).data)
