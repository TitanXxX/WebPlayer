import os
from django.core.exceptions import ValidationError


def validate_file_extension(value):
	ext = os.path.splitext(value.name)[1]
	valid_extensions = [".flac", ".mp3", ".m4a", ".ogg", ".wav", ".wma", ".flv", ".aac"]
	if False and not ext.lower() in valid_extensions:
		raise ValidationError("Unsupported file extension.")
