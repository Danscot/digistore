from django.contrib.auth.models import User

from rest_framework.decorators import api_view

from rest_framework.response import Response

from rest_framework import status

from django.contrib.auth import authenticate, login

from .models import Shop, Product

from django.shortcuts import get_object_or_404

# Create your views here.


@api_view(["GET"])

def dashboard_data(request):

	if not request.user.is_authenticated:

		return Response(status=401)

	shop = Shop.objects.get(owner=request.user)

	products = shop.products.all().values(

		"id", "name", "category", "description", "price"
	)

	return Response({

		"shop": {

			"name": shop.shop_name,

			"category": shop.shop_category,

			"wa_num": shop.wa_num,

			"location": shop.location,

			"id":shop.shop_id
		},

		"products": list(products)
	})

@api_view(['POST'])

def update_shop_infos(request):

	if not request.user.is_authenticated:

		return Response(status=401)

	data = request.data

	required_fields = [

		"shop_name",
		"shop_cat",
		"wa_num",
		"location",
	]

	for field in required_fields:

		if not data.get(field):

			return Response(
				{
					"status": "failed",
					"message": "Vous devez fournir toutes les informations",
				},
				status=status.HTTP_400_BAD_REQUEST,
			)

	current_shop = Shop.objects.filter(owner=request.user).first()

	if current_shop:

		current_shop.shop_name = data['shop_name']

		current_shop.shop_category = data["shop_cat"]

		current_shop.wa_num = data["wa_num"]

		current_shop.location = data["location"]

		current_shop.shop_id = f"@{data['shop_name'].replace(' ', '_').lower()}"

		current_shop.save()


		return Response(
			{
				"status": "updated",
				"message": "Vos informations on étaient enregistrer.",

			},
			status=status.HTTP_200_OK,
		)


	else:

		return Response(

			{

				"status":"Failed",
				"message": "Cette boutique n'existe pas."
			},

			status=status.HTTP_401_UNAUTHORIZED

		)




@api_view(["POST", "PUT", "DELETE"])
def manage_product(request, product_id=None):
	"""
	Create or update a product for the current user's shop.
	POST without product_id → create
	PUT with product_id → update
	"""
	if not request.user.is_authenticated:

		return Response({"detail": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

	# -----------------
	# DELETE PRODUCT
	# -----------------
	if request.method == "DELETE":

		product = get_object_or_404(Product, pk=product_id, shop__owner=request.user)

		product.delete()

		return Response({"status": "deleted"}, status=200)


	shop = get_object_or_404(Shop, owner=request.user)

	data = request.data

	required_fields = ["name", "category", "description"]

	if any(not data.get(field) for field in required_fields):

		return Response(

			{"detail": "Tous les champs sont obligatoires."},

			status=status.HTTP_400_BAD_REQUEST
		)

	# -----------------
	# UPDATE PRODUCT
	# -----------------

	if request.method == "PUT":

		if not product_id:

			return Response({"detail": "Product ID is required for update."}, status=400)

		product = get_object_or_404(shop.products, id=product_id)

		current_shop = Shop.objects.filter(owner=request.user).first()

		product.name = data["name"]

		product.category = data["category"]

		product.description = data["description"]

		product.shop = current_shop

		product.price = data["price"]

		# Optional: handle image if provided
		if request.FILES.get("image"):

			product.image = request.FILES["image"]

		product.save()

		return Response({

			"id": product.id,

			"name": product.name,

			"category": product.category,

			"description": product.description

		}, status=status.HTTP_200_OK)

	# -----------------
	# CREATE PRODUCT
	# -----------------
	elif request.method == "POST":

		product = Product.objects.create(

			shop=shop,

			name=data["name"],

			category=data["category"],

			description=data["description"],

			price=data["price"],

			image=request.FILES.get("image")
		)

		return Response({

			"id": product.id,

			"name": product.name,

			"category": product.category,

			"description": product.description

		}, status=status.HTTP_201_CREATED

		)
