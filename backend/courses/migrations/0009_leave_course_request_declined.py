from django.db import migrations, models


def rename_rejected_status(apps, schema_editor):
    LeaveCourseRequest = apps.get_model('courses', 'LeaveCourseRequest')
    LeaveCourseRequest.objects.filter(status='rejected').update(status='declined')


class Migration(migrations.Migration):
    dependencies = [('courses', '0008_leave_course_request')]

    operations = [
        migrations.RunPython(rename_rejected_status, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='leavecourserequest',
            name='status',
            field=models.CharField(choices=[('pending', 'Pending'), ('approved', 'Approved'), ('declined', 'Declined')], default='pending', max_length=10),
        ),
    ]
