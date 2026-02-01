from django.urls import path

from .views import github_deploy

urlpatterns = [

    path("cd/", github_deploy),
]
