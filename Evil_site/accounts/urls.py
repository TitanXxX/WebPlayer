from django.urls import path
from . import views

urlpatterns = [
	path("get", views.accounts, name="accounts"),
	path("login", views.login_view, name="login"),
	path("logout", views.logout_view, name="logout"),
	path("register", views.register, name="register"),
	path("info", views.info, name="info"),
]



