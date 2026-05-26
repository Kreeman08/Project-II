from rest_framework import viewsets
from .models import Assignment, Submission
from .serializers import AssignmentSerializer, SubmissionSerializer
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsTeacher, IsStudent



class AssignmentViewSet(viewsets.ModelViewSet):

    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer

    def get_permissions(self):

        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsTeacher()]

        
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class SubmissionViewSet(viewsets.ModelViewSet):

    serializer_class = SubmissionSerializer

    def get_queryset(self):

        user = self.request.user

        # Student sees only own submissions
        if user.role == 'student':
            return Submission.objects.filter(student=user)

        # Teacher sees all submissions
        return Submission.objects.all()

    def get_permissions(self):

        # Only students can submit work
        if self.action == 'create':
            return [IsAuthenticated(), IsStudent()]

        return [IsAuthenticated()]