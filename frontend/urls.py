from django.urls import path

from . import views

urlpatterns = [

    path('', views.index, name='index'),

    path('shops/', views.shops, name='shops'),

    path('login/', views.login, name='login'),

    path('signup/', views.signup, name='signup'),

    path('dashboard/', views.dashboard, name='dashboard'),

    path('shop/<str:shop_id>/', views.shop, name='shop_with_id'),

    path('shop/', views.shops, name="shop")

]
