from django.http import HttpResponse, JsonResponse
from django.template import loader
from django.shortcuts import render, redirect

from .models import User
from .forms import UserForm

from django.contrib.auth import authenticate, login, logout

from django.contrib.auth.decorators import login_required

import base64
import os

app_name = "accounts"

template = loader.get_template("base.html")


@login_required
def accounts(request):
	username = request.GET.get("username", False)
	if not username:
		user = request.user
	else:
		user = User.objects.filter(username=username)
		if not user:
			return JsonResponse({"status": 0}, status=404)
		user = user.first()
	return JsonResponse({"status": 1, "username": user.username}, status=200)


def login_view(request):
	if request.method == "POST":
		username = request.POST.get("username", "")
		password = request.POST.get("password", "")
		user = authenticate(request, username=username, password=password)
		if user is not None:
			login(request, user)
			return redirect("music/player")
		else:
			template = loader.get_template("base.html")
			return HttpResponse(template.render({"content": "Не удалось войти"}, request))
	else:
		if request.user.is_authenticated:
			return redirect("/music/player")
		template = loader.get_template("login.html")
		return HttpResponse(template.render({}, request))


@login_required
def logout_view(request):
	logout(request)
	return redirect("/login")

@login_required
def register(request):
	if request.method == "POST":
		user = UserForm(request.POST)
		if user.is_valid():
			post = user.save(commit=False)
			post.set_password(post.password)
			post.save()
			# На почтовый адрес направлено письмо для подтверждения регистрации.
			return HttpResponse(template.render({"content": "Пользователь успешно зарегистрирован"}, request))
		return HttpResponse(template.render({"content": user}, request))
	reg_template = loader.get_template("register.html")
	return HttpResponse(reg_template.render({}, request))


@login_required
def info(request):
	info_template = loader.get_template("info.html")
	if request.method == "DELETE":
		try:
			os.remove(request.user.photo.path)
		except:
			pass
		request.user.photo.delete()
		request.user.delete()
	elif request.method == "POST":
		old_password = request.user.password
		if "photo" in request.FILES:
			request.FILES["photo"].name = request.user.username + os.path.splitext(request.FILES["photo"].name)[1]
		user = UserForm(request.POST or None, request.FILES or None, instance=request.user)
		path = ""
		if request.user.photo:
			path = request.user.photo.path
		if user.is_valid():
			post = user.save(commit=False)
			if len(user.cleaned_data["password"]) >= 12:
				post.set_password(user.cleaned_data["password"])
			else:
				post.password = old_password
			post.save()
			if ("photo" in request.FILES) and path:
				try:
					os.remove(path)
				except:
					pass
			return HttpResponse(
				info_template.render({"user": request.user, "birth_date": request.user.birth_date.strftime("%Y-%m-%d")},
									 request))
		return HttpResponse(template.render({"content": user}, request))

	data = {"user": request.user, "birth_date": request.user.birth_date.strftime("%Y-%m-%d")}
	if request.user.photo:
		try:
			with open(request.user.photo.path, "rb") as file:
				data["photo"] = base64.b64encode(file.read()).decode("utf-8")
		except:
			pass
	return HttpResponse(info_template.render(data, request))
