from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [('courses', '0007_leave_request')]

    operations = [
        migrations.CreateModel(
            name='LeaveCourseRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')], default='pending', max_length=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('course', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='leave_course_requests', to='courses.course')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='leave_course_requests', to='users.user')),
                ('teacher', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='received_leave_course_requests', to='users.user')),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.AddConstraint(
            model_name='leavecourserequest',
            constraint=models.UniqueConstraint(condition=models.Q(('status', 'pending')), fields=('student', 'course'), name='one_pending_leave_course_request_per_student_course'),
        ),
    ]
