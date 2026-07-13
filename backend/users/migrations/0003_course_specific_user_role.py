from django.db import migrations, models


def make_standard_users(apps, schema_editor):
    User = apps.get_model('users', 'User')
    User.objects.filter(role__in=['teacher', 'student']).update(role='user')


class Migration(migrations.Migration):
    dependencies = [('users', '0002_alter_user_role')]

    operations = [
        migrations.RunPython(make_standard_users, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='user', name='role',
            field=models.CharField(choices=[('admin', 'Admin'), ('user', 'User')], default='user', max_length=20),
        ),
    ]
