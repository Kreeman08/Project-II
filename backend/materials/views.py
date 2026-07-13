from rest_framework import viewsets
from rest_framework import serializers
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from django.http import FileResponse, Http404
from .models import Material
from .serializers import MaterialSerializer
from courses.models import Enrollment

class MaterialViewSet(viewsets.ModelViewSet):

    queryset = Material.objects.all()
    serializer_class = MaterialSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Material.objects.all()

        return Material.objects.filter(
            Q(course__teacher=user) | Q(course__enrollments__student=user)
        ).distinct()

    def get_permissions(self):
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        course = serializer.validated_data.get('course')
        if course.teacher != self.request.user:
            enrollment = Enrollment.objects.filter(course=course, student=self.request.user).first()
            if not enrollment:
                raise serializers.ValidationError(
                    {'course': 'You must be enrolled in this class to upload files.'}
                )
            if not course.allow_student_file_sharing or not enrollment.can_share_files:
                raise serializers.ValidationError(
                    {'file': 'Student file sharing is disabled for this class.'}
                )
        upload = serializer.validated_data.get('file')
        serializer.save(
            uploaded_by=self.request.user,
            file_type=(upload.content_type or '') if upload else 'link',
            file_size=upload.size if upload else 0,
        )

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

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        material = self.get_object()
        if not material.file:
            return Response({'detail': 'This resource is a link and cannot be downloaded from the server.'}, status=400)
        response = FileResponse(material.file.open('rb'), as_attachment=True, filename=material.title)
        response['Content-Type'] = material.file_type or 'application/octet-stream'
        return response
        
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
