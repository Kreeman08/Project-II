from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import CourseViewSet, EnrollmentViewSet, JoinCourseRequestViewSet, LeaveCourseRequestViewSet


router = DefaultRouter()

router.register('courses', CourseViewSet)
router.register('enrollments', EnrollmentViewSet)
router.register('join-course-requests', JoinCourseRequestViewSet)
router.register('leave-course-requests', LeaveCourseRequestViewSet)


urlpatterns = [
    path('', include(router.urls)),
]
