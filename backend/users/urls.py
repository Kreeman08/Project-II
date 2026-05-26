from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LMSJWTView, UserViewSet, RegisterView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register('', UserViewSet, basename='users')

urlpatterns = [
    path('', include(router.urls)),

    # Register
    path('register/', RegisterView.as_view(), name='register'),

    # Login (JWT)
    path('login/', LMSJWTView.as_view(), name='login'),

    # Refresh token
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
