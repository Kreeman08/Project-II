from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('materials', '0001_initial')]

    operations = [
        migrations.AddField(model_name='material', name='file_size', field=models.PositiveBigIntegerField(default=0)),
        migrations.AddField(model_name='material', name='file_type', field=models.CharField(blank=True, max_length=100)),
    ]
