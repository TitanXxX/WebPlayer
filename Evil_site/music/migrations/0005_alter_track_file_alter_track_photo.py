# Generated by Django 4.2.11 on 2024-06-15 21:22

import django.core.files.storage
from django.db import migrations, models
import pathlib


class Migration(migrations.Migration):

    dependencies = [
        ('music', '0004_alter_track_file'),
    ]

    operations = [
        migrations.AlterField(
            model_name='track',
            name='file',
            field=models.FileField(storage=django.core.files.storage.FileSystemStorage(location=pathlib.PureWindowsPath('C:/Users/TitanX/GDisk/Programming/PYServer/Evil_site/media/music')), upload_to=''),
        ),
        migrations.AlterField(
            model_name='track',
            name='photo',
            field=models.ImageField(null=True, storage=django.core.files.storage.FileSystemStorage(location=pathlib.PureWindowsPath('C:/Users/TitanX/GDisk/Programming/PYServer/Evil_site/media/image')), upload_to=''),
        ),
    ]
