import os

os.environ["PATH"] += os.pathsep + "../../Evil_site/ffmpeg/bin"

from django.http import HttpResponse, JsonResponse
from django.template import loader
from .models import Track
from .forms import TrackForm, TrackFormUpdate

from django.contrib.auth.decorators import login_required

import base64
from accounts.models import Client_Track
from pydub import AudioSegment
from io import BytesIO

template = loader.get_template("base.html")
# player_template=loader.get_template("player.html")
upload_template = loader.get_template("upload_track.html")



@login_required
def player(request):
	if 0:
		player_template = loader.get_template("player.html")
	else:
		player_template = loader.get_template("player_test.html")
	return HttpResponse(player_template.render({}, request))

@login_required
def music(request, id=None):
	if not id:
		return JsonResponse({"content": "'ID' not found"}, status=404)
	try:
		track = Track.objects.get(id=id)
	except:
		if request.method == "GET":
			return HttpResponse(template.render({"content": "Music with id(" + str(id) + ") not found"}, request),
								status=404)
		return JsonResponse({"content": "Music with id(" + str(id) + ") not found"}, status=404)
	if request.method == "GET":
		info_template = loader.get_template("track_info.html")
		data = {"title": track.title, "author": track.author}
		if track.photo:
			try:
				with open(track.photo.path, "rb") as file:
					data["photo"] = base64.b64encode(file.read()).decode("utf-8")
			except:
				pass
		return HttpResponse(info_template.render(data, request))
	elif request.method == "DELETE":
		if track.user != request.user:
			return JsonResponse({"content": "You have no permissions to edit music with id(" + str(id) + ")."},
								status=403)
		try:
			os.remove(track.file.path)
		except:
			pass
		track.file.delete(save=True)
		track.delete()
		return JsonResponse({"content": "Music with id(" + str(id) + ") successfully removed"}, status=200)
	elif request.method == "POST":
		if request.POST.get("load", "false") == "true":
			try:
				with open(track.file.path, "rb") as file:
					data = file.read()
				data = base64.b64encode(data).decode("ascii")
				return JsonResponse({"source": data}, status=200)
			except Exception as e:
				print("Exception when reading:", track.file, e)
		else:
			if track.user != request.user:
				return HttpResponse(
					template.render({"content": "You have no permissions to edit music with id(" + str(id) + ")."},
									request), status=403)
			title = request.POST.get("title", "")
			author = request.POST.get("author", "")
			if title and (len(author) < 64):
				track.title = title
			if author and (len(author) < 64):
				track.author = author
			path = ""
			if track.photo:
				path = track.photo.path

			if "photo" in request.FILES:
				request.FILES["photo"].name = str(track.id) + os.path.splitext(request.FILES["photo"].name)[1]
				track.photo = request.FILES["photo"]
			track.save()
			if ("photo" in request.FILES) and path:
				try:
					os.remove(path)
				except:
					pass
			request.method = "GET"
			return music(request, id)
	return player(request)


@login_required
def upload(request):
	if request.method == "POST":
		track = TrackForm(request.POST, request.FILES)
		if track.is_valid():
			file = BytesIO(request.FILES["file"].read())
			song = AudioSegment.from_file(file)#, format="mp3"
			time = len(song) // 1000
			song.export(file, format="flac")

			track = track.save(commit=False)
			time_str = ""
			h = time // 3600
			if h:
				time_str += str(h).rjust(2,"0") + ":"
				time %= 3600
			m = time // 60
			if h:
				time_str += str(m).rjust(2,"0") + ":"
			else:
				time_str += str(m) + ":"
			if m:
				time %= 60
			time_str += str(time).rjust(2,"0")
			track.time = time_str

			track.user = request.user
			track.file.name = os.path.splitext(track.file.name)[0] + ".flac"
			track.file.data = file.read()
			track.save()
			os.rename(track.file.path, os.path.dirname(track.file.path) + "/" + str(track.id) + ".flac")
			track.file.name = str(track.id) + ".flac"
			track.save()
			return HttpResponse(template.render({"content": "Track saved"}, request))
		return HttpResponse(template.render({"content": "Error:" + str(track)}, request))
	return HttpResponse(upload_template.render({}, request))

@login_required
def musiclist(request):
	q = request.POST.get("q", "")
	tracks = Track.objects.all()
	if request.POST.get("mymusic", False) == "true":
		tracks = tracks.filter(id__in=Client_Track.objects.filter(user=request.user).values_list("track", flat=True))
	if q:
		tracks = tracks.filter(title__iregex=q).union(tracks.filter(author__iregex=q))
	output = dict(zip(range(len(tracks)), tracks.values("id", "title", "author", "photo", "time")))
	for i in output:
		output[i]["inmymusic"] = "1" if Client_Track.objects.filter(user=request.user, track=output[i]["id"]) else "0"
		track = Track.objects.get(id = output[i]["id"])
		if track.photo:
			try:
				with open(track.photo.path, "rb") as file:
					output[i]["photo"] = base64.b64encode(file.read()).decode("utf-8")
			except:
				pass
	return JsonResponse(output, status=200)

@login_required
def addtomusiclist(request):
	track_id = int(request.POST.get("track_id", None))
	if track_id is None:
		return JsonResponse({"success": "false"}, status=200)
	track = Track.objects.get(pk=track_id)
	flag_add = request.POST.get("flag_add", False) == "true"
	if flag_add:
		flag = request.user.ADD_TO_MUSICLIST(track)
	else:
		flag = request.user.DEL_FROM_MUSICLIST(track)
	return JsonResponse({"success": "true" if flag else "false"}, status=200)
