from django.db import migrations, models
import random
import string


def fill_course_codes(apps, schema_editor):
    Course = apps.get_model('courses', 'Course')
    for course in Course.objects.all():
        if course.course_code:
            continue
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        while Course.objects.filter(course_code=code).exists():
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        course.course_code = code
        course.save(update_fields=['course_code'])


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='course',
            name='course_code',
            field=models.CharField(blank=True, max_length=12, null=True, unique=True),
        ),
        migrations.RunPython(fill_course_codes, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='course',
            name='course_code',
            field=models.CharField(blank=True, max_length=12, unique=True),
        ),
    ]
