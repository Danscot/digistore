from django.shortcuts import render, redirect

from django.contrib.auth.decorators import login_required

from django.contrib.auth import logout

from django.http import JsonResponse

from django.contrib import messages

from shop.models import Shop, Product

from django.core.serializers.json import DjangoJSONEncoder

from django.forms.models import model_to_dict

from django.db.models import Count

from django.conf import settings


import json

def index(request):

	return render(request, 'index_fr.html')

def shops(request):

	shops_qs = (

		Shop.objects

		.annotate(product_count=Count("products"))

		.values(
			"id",
			"shop_name",
			"shop_category",
			"location",
			"shop_id",
			"product_count",
		)
	)

	return render(request, "shops.html", {

		"shops": json.dumps(list(shops_qs), cls=DjangoJSONEncoder)
	})

def signup(request):

	return render(request, 'signup.html')

def login(request):

	return render(request, 'login.html')

@login_required(login_url="signup")
def dashboard(request):

	if Shop.objects.filter(owner=request.user).exists():

		current_shop = Shop.objects.get(owner=request.user)

		return render(request, 'dashboard.html', {"id":current_shop.shop_id})

	return render(request, 'index_fr.html')

def shop(request, shop_id):

	current_shop = Shop.objects.get(shop_id=shop_id)

	products = Product.objects.filter(shop=current_shop)

	shop_data = {
		"name": current_shop.shop_name,
		"category": current_shop.shop_category,
		"location": current_shop.location,
		"whatsapp": current_shop.wa_num,
		"id": current_shop.shop_id
	}

	products_data = []

	for p in products:

		print(p.id)
		
		# Convert JSON list of image paths to absolute URLs
		images = [request.build_absolute_uri(settings.MEDIA_URL + img) for img in p.image] if p.image else []

		products_data.append({

			"id": p.id,
			"name": p.name,
			"description": p.description,
			"category": p.category,
			"price": p.price,
			"images": images,

		})

	context = {
		"shop_json": json.dumps(shop_data, cls=DjangoJSONEncoder),
		"products_json": json.dumps(products_data, cls=DjangoJSONEncoder),
		"num": len(products),
	}

	return render(request, "my_shop.html", context)

def view_prod(request, shopId, productId):

	return render(request, 'view_prod.html')