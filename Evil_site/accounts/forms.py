from django.forms import ModelForm
from django import forms
from .models import User

class UserForm(ModelForm):
	class Meta:
		model = User
		fields = ["photo", "username", "email", "name", "lastname", "password", "gender", "birth_date"]

	photo = forms.ImageField(required = False)
	password = forms.CharField(min_length=12, max_length=256, required = False)

