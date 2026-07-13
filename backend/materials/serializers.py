from rest_framework import serializers
from .models import Material


MAX_FILE_SIZE = 10 * 1024 * 1024
ALLOWED_EXTENSIONS = {
    '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt',
    '.csv', '.zip', '.png', '.jpg', '.jpeg', '.gif',
}


class MaterialSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    uploaded_by_username = serializers.CharField(source='uploaded_by.username', read_only=True)

    class Meta:
        model = Material
        fields = [
            'id',
            'course',
            'uploaded_by',
            'uploaded_by_name',
            'uploaded_by_username',
            'title',
            'file',
            'link',
            'file_type',
            'file_size',
            'uploaded_at'
        ]

        read_only_fields = ['uploaded_by', 'uploaded_by_name', 'uploaded_by_username', 'file_type', 'file_size', 'uploaded_at']

    def validate_file(self, file):
        if not file:
            return file
        extension = '.' + file.name.rsplit('.', 1)[-1].lower() if '.' in file.name else ''
        if extension not in ALLOWED_EXTENSIONS:
            raise serializers.ValidationError('Unsupported file type. Upload a document, spreadsheet, archive, image, or text file.')
        if file.size > MAX_FILE_SIZE:
            raise serializers.ValidationError('Files must be 10 MB or smaller.')
        return file

    def validate(self, attrs):
        if not attrs.get('file') and not attrs.get('link') and not getattr(self.instance, 'file', None) and not getattr(self.instance, 'link', None):
            raise serializers.ValidationError('Provide a file or a link.')
        return attrs
