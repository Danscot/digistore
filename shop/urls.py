from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [

    path('api/dashboard/', views.dashboard_data, name="dashboard_api"),
    
    path('api/update_shop_infos/', views.update_shop_infos, name="update_shop_infos"),

    # Product CRUD

    path('api/products/', views.manage_product, name='create_product'),

    path('api/products/<int:product_id>/', views.manage_product, name='update_product'),
]

# Serve media files in development
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
