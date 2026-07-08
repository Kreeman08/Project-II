from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import MaterialViewSet, material_view


router = DefaultRouter()
router.register('materials', MaterialViewSet)


urlpatterns = [
    path('', include(router.urls)),
    path("materials/view/<int:pk>/", material_view),
]