from rest_framework import status
from rest_framework.test import APITestCase

from users.models import User
from .models import Course, CoursePost, Enrollment, JoinCourseRequest, Notification


class ClassroomManagementTests(APITestCase):
    def setUp(self):
        self.teacher = User.objects.create_user('teacher', password='password')
        self.student = User.objects.create_user('student', password='password')
        self.other_student = User.objects.create_user('other', password='password')
        self.course = Course.objects.create(name='Science', teacher=self.teacher)

    def test_auto_join_and_leave_create_teacher_notifications(self):
        self.course.enrollment_requires_approval = False
        self.course.save(update_fields=['enrollment_requires_approval'])
        self.client.force_authenticate(self.student)
        join = self.client.post('/api/enrollments/join/', {'course_code': self.course.course_code})
        enrollment = Enrollment.objects.get(student=self.student, course=self.course)
        leave = self.client.post(f'/api/enrollments/{enrollment.id}/leave/')

        self.assertEqual(join.status_code, status.HTTP_201_CREATED)
        self.assertEqual(leave.status_code, status.HTTP_200_OK)
        self.assertFalse(Enrollment.objects.filter(pk=enrollment.id).exists())
        self.assertEqual(Notification.objects.filter(recipient=self.teacher).count(), 2)

    def test_join_requires_teacher_approval_by_default(self):
        self.client.force_authenticate(self.student)

        response = self.client.post('/api/enrollments/join/', {'course_code': self.course.course_code})

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('join_request', response.data)
        self.assertFalse(Enrollment.objects.filter(student=self.student, course=self.course).exists())
        self.assertTrue(JoinCourseRequest.objects.filter(student=self.student, course=self.course, status='pending').exists())

    def test_teacher_can_approve_join_request(self):
        join_request = JoinCourseRequest.objects.create(
            student=self.student,
            course=self.course,
            teacher=self.teacher,
        )
        self.client.force_authenticate(self.teacher)

        response = self.client.post(f'/api/join-course-requests/{join_request.id}/decide/', {'status': 'approved'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'approved')
        self.assertTrue(Enrollment.objects.filter(student=self.student, course=self.course).exists())

    def test_teacher_can_reject_join_request_without_enrolling_student(self):
        join_request = JoinCourseRequest.objects.create(
            student=self.student,
            course=self.course,
            teacher=self.teacher,
        )
        self.client.force_authenticate(self.teacher)

        response = self.client.post(f'/api/join-course-requests/{join_request.id}/decide/', {'status': 'rejected'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'rejected')
        self.assertFalse(Enrollment.objects.filter(student=self.student, course=self.course).exists())

    def test_teacher_removal_notifies_student_and_removes_access(self):
        enrollment = Enrollment.objects.create(student=self.student, course=self.course)
        self.client.force_authenticate(self.teacher)

        response = self.client.post(f'/api/enrollments/{enrollment.id}/remove-student/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Enrollment.objects.filter(pk=enrollment.id).exists())
        self.assertTrue(Notification.objects.filter(recipient=self.student, kind='student_removed').exists())

    def test_comment_and_file_sharing_settings_are_enforced(self):
        Enrollment.objects.create(student=self.student, course=self.course)
        self.course.allow_student_comments = False
        self.course.allow_student_file_sharing = False
        self.course.save()
        self.client.force_authenticate(self.student)

        response = self.client.post('/api/course-posts/', {'course': self.course.id, 'text': 'Blocked'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(CoursePost.objects.exists())

    def test_notification_history_is_private_and_can_be_marked_read(self):
        notification = Notification.objects.create(
            recipient=self.student,
            course=self.course,
            kind='test_added',
            message='New test.',
        )
        self.client.force_authenticate(self.student)
        response = self.client.get('/api/notifications/')
        marked = self.client.post(f'/api/notifications/{notification.id}/mark_read/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(marked.status_code, status.HTTP_200_OK)
        self.assertTrue(marked.data['is_read'])
