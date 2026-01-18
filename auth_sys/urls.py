from django.urls import path

from . import views

urlpatterns = [

    path('api/signin/', views.signin, name='signin_api'),

    path('api/login/', views.login_view, name='login_api'),

    path('logout/', views.user_logout, name="logout"),

    path('api/check-auth/', views.check_auth, name="check-auth"),

]
