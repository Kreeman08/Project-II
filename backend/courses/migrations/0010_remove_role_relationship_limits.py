from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [('courses', '0009_leave_course_request_declined')]

    operations = [
        migrations.AlterField(
            model_name='course', name='teacher',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='courses', to='users.user'),
        ),
        migrations.AlterField(
            model_name='enrollment', name='student',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='enrollments', to='users.user'),
        ),
    ]
