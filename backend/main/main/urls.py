from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from assignments.views import AssignmentViewSet, SubmissionViewSet
from courses.views import CoursePostReplyViewSet, CoursePostViewSet, CourseViewSet, EnrollmentViewSet
from materials.views import MaterialViewSet
from tests_app.views import AnswerViewSet, OptionViewSet, QuestionViewSet, TestSubmissionViewSet, TestViewSet
from users.views import LMSJWTView, RegisterView, UserViewSet
from main.views import home

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='users')
router.register(r'courses', CourseViewSet, basename='courses')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollments')
router.register(r'course-posts', CoursePostViewSet, basename='course-posts')
router.register(r'course-post-replies', CoursePostReplyViewSet, basename='course-post-replies')
router.register(r'materials', MaterialViewSet, basename='materials')
router.register(r'assignments', AssignmentViewSet, basename='assignments')
router.register(r'submissions', SubmissionViewSet, basename='submissions')
router.register(r'tests', TestViewSet, basename='tests')
router.register(r'questions', QuestionViewSet, basename='questions')
router.register(r'options', OptionViewSet, basename='options')
router.register(r'test-submissions', TestSubmissionViewSet, basename='test-submissions')
router.register(r'answers', AnswerViewSet, basename='answers')

urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),

    path('api/', include(router.urls)),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/token/', LMSJWTView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
