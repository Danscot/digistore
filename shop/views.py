from django.contrib.auth.models import User

from rest_framework.decorators import api_view

from rest_framework.response import Response

from rest_framework import status

from django.contrib.auth import authenticate, login

from .models import Shop

# Create your views here.


@api_view(["GET"])

def dashboard_data(request):

	if not request.user.is_authenticated:

		return Response(status=401)

	shop = Shop.objects.get(owner=request.user)

	products = shop.products.all().values(

		"id", "name", "category", "description"
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

def updating_shop_infos(request):

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

	current_shop = Shop.objects.filter(shop_name=data["shop_name"], user=request.user)

	if current_shop.exist():

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



