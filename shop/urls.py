from django.urls import path

from . import views

urlpatterns = [

    path('api/dashboard/', views.dashboard_data, name="dashboard_api")

]
