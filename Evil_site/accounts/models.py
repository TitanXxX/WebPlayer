from django.db import models

from django.core.files.storage import FileSystemStorage
from django.core.validators import int_list_validator

from django.contrib.auth.models import AbstractUser
from Evil_site.settings import MEDIA_ROOT


avatar_storage = FileSystemStorage(location = MEDIA_ROOT / "avatar")

class User(AbstractUser):
	username=models.CharField(max_length=64,primary_key=True,null=False, name="username")
	email=models.EmailField(max_length=256,null=False,name="email")

	name=models.CharField(max_length=64,null=False,name="name")
	lastname=models.CharField(max_length=64,null=False,name="lastname")

	password=models.CharField(max_length=256,null=False,name="password")

	GENDER_CHOICES = (
		('M', 'Male'),
		('F', 'Female'),
	)
	gender = models.CharField(max_length = 1, choices = GENDER_CHOICES, default="M", null=False, name="gender")

	reg_date=models.DateTimeField(auto_now_add=True,null=False,name="reg_date")
	birth_date=models.DateField(null=False,name="birth_date")
	photo = models.ImageField(storage = avatar_storage, null = True, max_length = 100, name = "photo")
	
	
	confirmed=models.BooleanField(default=False,null=False,name="confirmed")

	def __str__(self):
		return self.username

	def ADD_TO_MUSICLIST(self, track):
		if(not Client_Track.objects.filter(user = self, track = track)):
			new_track = Client_Track(user = self, track = track)
			new_track.save()
			return True
		return False
	
	def DEL_FROM_MUSICLIST(self, track):
		track_obj = Client_Track.objects.filter(user = self, track = track)
		if(track_obj):
			track_obj[0].delete()
			return True
		return False

class Client_Track(models.Model):
	from music.models import Track
	user = models.ForeignKey(User, on_delete = models.CASCADE, null = False, name = "user")
	track = models.ForeignKey(Track, on_delete = models.CASCADE, null = False, name = "track")

	def __int__(self):
		return self.track.id


