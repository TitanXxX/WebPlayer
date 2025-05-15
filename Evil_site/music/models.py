from django.db import models
from django.core.files.storage import FileSystemStorage

from accounts.models import User
from Evil_site.settings import MEDIA_ROOT

from .validators import validate_file_extension

music_storage = FileSystemStorage(location=MEDIA_ROOT / "music")
photo_storage = FileSystemStorage(location=MEDIA_ROOT / "image")


class Track(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE, null=False, name="user")
	title = models.CharField(max_length=64, null=False, name="title")
	author = models.CharField(max_length=64, null=False, name="author")

	genre = models.CharField(max_length=64, null=True, name="genre")

	file = models.FileField(storage=music_storage, null=False, max_length=100, name="file", validators=[validate_file_extension])
	photo = models.ImageField(storage=photo_storage, null=True, max_length=100, name="photo")
	time = models.CharField(max_length=12, null=False, default="0:00", name="time")

	add_date = models.DateTimeField(auto_now_add=True, null=False, name="add_date")

	def __str__(self):
		return self.title + " - " + self.author
