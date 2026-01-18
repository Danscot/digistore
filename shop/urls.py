from django.urls import path

from . import views

urlpatterns = [

    path('api/dashboard/', views.dashboard_data, name="dashboard_api"),

    path('api/update_shop_infos/', views.update_shop_infos, name="update_shop_infos"),

    path('api/products/', views.manage_product, name='create_product'),
    
    path('api/products/<int:product_id>/', views.manage_product, name='update_product'),

]
