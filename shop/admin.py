from django.contrib import admin

from .models import Shop, Product, ShopHistory


@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):

    list_display = (
        "shop_name",
        "shop_category",
        "owner",
        "wa_num",
        "location",
        "created_at",
    )

    list_filter = ("shop_category", "created_at")

    search_fields = ("shop_name", "wa_num", "location")

    ordering = ("-created_at",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "shop",
        "category",
        "created_at",
    )

    list_filter = ("category", "created_at")

    search_fields = ("name", "description")

    ordering = ("-created_at",)



@admin.register(ShopHistory)
class ShopHistory(admin.ModelAdmin):

    list_display = (
        
        "old_shop_name",
        "shop",
    )

    list_filter = ("shop", "old_shop_name")

    search_fields = ("old_shop_name", "shop")
