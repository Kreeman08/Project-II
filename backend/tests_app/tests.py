from rest_framework import status
from rest_framework.test import APITestCase

from courses.models import Course, Enrollment
from users.models import User
from .models import Option, Question, Test, TestSubmission


class TestFeatureApiTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user('owner', password='password')
        self.other_teacher = User.objects.create_user('other', password='password')
        self.student = User.objects.create_user('student', password='password')
        self.course = Course.objects.create(name='Science', teacher=self.owner)
        self.other_course = Course.objects.create(name='Maths', teacher=self.other_teacher)
        Enrollment.objects.create(student=self.student, course=self.course)

    def make_complete_test(self, published=False):
        test = Test.objects.create(
            course=self.course,
            title='Unit quiz',
            created_by=self.owner,
            published=published,
        )
        question = Question.objects.create(test=test, text='Which option is correct?')
        for index in range(4):
            Option.objects.create(
                question=question,
                text=f'Choice {index + 1}',
                is_correct=index == 2,
            )
        return test, question

    def test_owner_cannot_publish_an_invalid_test(self):
        test = Test.objects.create(course=self.course, title='Draft', created_by=self.owner)
        self.client.force_authenticate(self.owner)

        response = self.client.patch(f'/api/tests/{test.id}/', {'published': True}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('published', response.data)

    def test_student_only_sees_published_tests_without_answer_keys(self):
        published, _ = self.make_complete_test(published=True)
        Test.objects.create(course=self.course, title='Unpublished', created_by=self.owner)
        self.client.force_authenticate(self.student)

        response = self.client.get('/api/tests/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([item['id'] for item in response.data], [published.id])
        self.assertNotIn('is_correct', response.data[0]['questions'][0]['options'][0])

    def test_only_course_owner_can_manage_test_content(self):
        test, question = self.make_complete_test()
        self.client.force_authenticate(self.student)
        self.assertEqual(
            self.client.post('/api/questions/', {'test': test.id, 'text': 'Forbidden'}, format='json').status_code,
            status.HTTP_403_FORBIDDEN,
        )
        self.assertEqual(
            self.client.patch(f'/api/questions/{question.id}/', {'text': 'Changed'}, format='json').status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.client.force_authenticate(self.other_teacher)
        self.assertEqual(
            self.client.delete(f'/api/tests/{test.id}/').status_code,
            status.HTTP_404_NOT_FOUND,
        )
        self.assertEqual(
            self.client.post('/api/options/', {
                'question': question.id, 'text': 'Forbidden', 'is_correct': False,
            }, format='json').status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_published_content_is_locked_until_unpublished(self):
        test, question = self.make_complete_test(published=True)
        self.client.force_authenticate(self.owner)

        response = self.client.patch(f'/api/questions/{question.id}/', {'text': 'Changed'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'][0].code, 'invalid')

    def test_enrolled_student_can_submit_once_with_valid_answers(self):
        test, question = self.make_complete_test(published=True)
        correct_option = question.options.get(is_correct=True)
        self.client.force_authenticate(self.student)
        payload = {
            'test': test.id,
            'answers': [{'question': question.id, 'selected_option': correct_option.id}],
        }

        response = self.client.post('/api/test-submissions/', payload, format='json')
        duplicate = self.client.post('/api/test-submissions/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['marks'], 1)
        self.assertEqual(TestSubmission.objects.count(), 1)
        self.assertEqual(duplicate.status_code, status.HTTP_400_BAD_REQUEST)

    def test_timed_submission_can_save_unanswered_questions(self):
        test, _ = self.make_complete_test(published=True)
        self.client.force_authenticate(self.student)

        response = self.client.post('/api/test-submissions/', {'test': test.id, 'answers': []}, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['marks'], 0)
