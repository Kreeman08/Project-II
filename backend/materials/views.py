from rest_framework import viewsets
from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.http import FileResponse, Http404
from .models import Material
from .models import Material
from .serializers import MaterialSerializer

class MaterialViewSet(viewsets.ModelViewSet):

    queryset = Material.objects.all()
    serializer_class = MaterialSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Material.objects.all()

        return Material.objects.filter(
            Q(course__teacher=user) | Q(course__enrollments__student=user)
        ).distinct()

    def get_permissions(self):
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        course = serializer.validated_data.get('course')
        if course.teacher != self.request.user:
            raise serializers.ValidationError(
                {'course': 'Only the class teacher can upload materials.'}
            )
        serializer.save(uploaded_by=self.request.user)

    def perform_update(self, serializer):
        material = self.get_object()
        if material.course.teacher != self.request.user:
            raise serializers.ValidationError(
                {'course': 'Only the class teacher can rename materials.'}
            )
        serializer.save()

    def perform_destroy(self, instance):
        if instance.course.teacher != self.request.user:
            raise serializers.ValidationError(
                {'course': 'Only the class teacher can delete materials.'}
            )
        instance.delete()
        
def material_view(request, pk):
    try:
        material = Material.objects.get(pk=pk)

        if not material.file:
            raise Http404("File not found")

        return FileResponse(
            material.file.open("rb"),
            content_type="application/octet-stream",
            as_attachment=False
        )

    except Material.DoesNotExist:
        raise Http404("Material not found")
