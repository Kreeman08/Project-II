from rest_framework import serializers
from .models import Material


class MaterialSerializer(serializers.ModelSerializer):

    class Meta:
        model = Material
        fields = [
            'id',
            'course',
            'uploaded_by',
            'title',
            'file',
            'link',
            'uploaded_at'
        ]

        read_only_fields = ['uploaded_by']