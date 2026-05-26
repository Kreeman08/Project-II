from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Material
from .serializers import MaterialSerializer

from users.permissions import IsTeacher, IsStudent


class MaterialViewSet(viewsets.ModelViewSet):

    queryset = Material.objects.all()
    serializer_class = MaterialSerializer

    def get_permissions(self):

        if self.action == 'create':
            return [IsAuthenticated(), IsTeacher()]

        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)