from django.shortcuts import get_object_or_404

from django.contrib.auth.models import User

from rest_framework.decorators import api_view

from rest_framework.response import Response

from rest_framework import status

from django.conf import settings

from .models import Shop, Product

import os

# -------------------------------
# Dashboard Data
# -------------------------------
@api_view(["GET"])
def dashboard_data(request):
    if not request.user.is_authenticated:
        return Response({"detail": "Unauthorized"}, status=401)

    shop = get_object_or_404(Shop, owner=request.user)
    products = shop.products.all().values(
        "id", "name", "category", "description", "price", "image"
    )

    # Ensure image URLs are absolute if available
    products_list = []
    for p in products:
        products_list.append({
            "id": p["id"],
            "name": p["name"],
            "category": p["category"],
            "description": p["description"],
            "price": p["price"],
            "image": request.build_absolute_uri(p["image"]) if p["image"] else None
        })

    return Response({
        "shop": {
            "name": shop.shop_name,
            "category": shop.shop_category,
            "wa_num": shop.wa_num,
            "location": shop.location,
            "id": shop.shop_id
        },
        "products": products_list
    })


# -------------------------------
# Update Shop Info
# -------------------------------
@api_view(["POST"])
def update_shop_infos(request):
    if not request.user.is_authenticated:
        return Response({"detail": "Unauthorized"}, status=401)

    data = request.data
    required_fields = ["shop_name", "shop_cat", "wa_num", "location"]
    if any(not data.get(f) for f in required_fields):
        return Response(
            {"detail": "Tous les champs sont obligatoires."},
            status=status.HTTP_400_BAD_REQUEST
        )

    shop = get_object_or_404(Shop, owner=request.user)
    shop.shop_name = data["shop_name"]
    shop.shop_category = data["shop_cat"]
    shop.wa_num = data["wa_num"]
    shop.location = data["location"]
    shop.shop_id = f"@{data['shop_name'].replace(' ', '_').lower()}"
    shop.save()

    return Response({"status": "updated", "message": "Informations mises à jour"})


# -------------------------------
# Create / Update / Delete Product
# -------------------------------
@api_view(["POST", "PUT", "DELETE"])
def manage_product(request, product_id=None):
    if not request.user.is_authenticated:
        return Response({"detail": "Unauthorized"}, status=401)

    shop = get_object_or_404(Shop, owner=request.user)

    # DELETE PRODUCT
    if request.method == "DELETE":
        product = get_object_or_404(Product, id=product_id, shop=shop)
        product.delete()
        return Response({"status": "deleted"}, status=200)

    data = request.data

    # CREATE PRODUCT
    if request.method == "POST":
        required_fields = ["name", "category", "description", "price"]
        if any(not data.get(f) for f in required_fields):
            return Response({"detail": "Tous les champs sont obligatoires."}, status=400)

        product = Product.objects.create(
            shop=shop,
            name=data["name"],
            category=data["category"],
            description=data["description"],
            price=data["price"],
            image=[]  # initialize empty list
        )

        # handle image upload
        image_file = request.FILES.get("image")
        if image_file:
            filename = f"{product.id}_{image_file.name}"
            filepath = os.path.join(settings.MEDIA_ROOT, filename)
            with open(filepath, "wb+") as f:
                for chunk in image_file.chunks():
                    f.write(chunk)
            product.image.append(filename)
            product.save()

    # UPDATE PRODUCT
    elif request.method == "PUT":
        if not product_id:
            return Response({"detail": "Product ID requis."}, status=400)

        product = get_object_or_404(Product, id=product_id, shop=shop)
        product.name = data.get("name", product.name)
        product.category = data.get("category", product.category)
        product.description = data.get("description", product.description)
        product.price = data.get("price", product.price)

        # handle image upload
        image_file = request.FILES.get("image")
        if image_file:
            filename = f"{product.id}_{image_file.name}"
            filepath = os.path.join(settings.MEDIA_ROOT, filename)
            with open(filepath, "wb+") as f:
                for chunk in image_file.chunks():
                    f.write(chunk)
            product.image.append(filename)

        product.save()

    # return product JSON with proper URLs
    return Response({
        "id": product.id,
        "name": product.name,
        "category": product.category,
        "description": product.description,
        "price": product.price,
        "images": [
            request.build_absolute_uri(settings.MEDIA_URL + img)
            for img in product.image
        ] if product.image else []
    }, status=200 if request.method == "PUT" else 201)



@api_view(["GET"])
def shop_detail(request, shop_id):

    shop = get_object_or_404(Shop, shop_id=shop_id)

    products_qs = shop.products.all().values(

        "id", "name", "category", "description", "image"
    )

    products_list = []

    for p in products_qs:

        print(p)

        images = [request.build_absolute_uri(settings.MEDIA_URL + img) for img in p["image"]] if p["image"] else []

        products_list.append({
            "id": p["id"],
            "name": p["name"],
            "category": p["category"],
            "description": p["description"],
            "image": images
        })

    return Response({
        "shop": {
            "id": shop.shop_id,
            "name": shop.shop_name,
            "category": shop.shop_category,
            "location": shop.location,
            "wa_num": shop.wa_num
        },
        "products": products_list
    })
