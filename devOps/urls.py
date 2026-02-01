from django.urls import path

from .views import github_deploy, backup_endpoint

urlpatterns = [

    path("cd/", github_deploy),

    path("backup/", backup_endpoint),

]
