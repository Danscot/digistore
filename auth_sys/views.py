
from rest_framework.decorators import api_view

from rest_framework.response import Response

from rest_framework import status

from django.contrib.auth import authenticate, login, logout

from rest_framework.decorators import api_view

from rest_framework.response import Response

from rest_framework import status

from .models import Shop

import random


def gen_code(user):

	code = random.randint(100000, 999999)

	return code


@api_view(["POST"])

def signin(request):

	try:

		shop_name = request.data.get("shop_name")

		shop_category = request.data.get("shop_category")

		username = request.data.get("username")

		wa_num = request.data.get("wa_num")

		location = request.data.get("location")

		password = request.data.get("password")

		password_2 = request.data.get("password_2")


	except Exception as e:

		return Response (

			{

				"status": "failed",

				"message": "Vous devez fournir toutes les informations",

				"error_message": str(e)
			},

			status=HTTP_500_INTERNAL_SERVER_ERROR

		)

	# Check if user exists
	if (Shop.objects.filter(shop_name=shop_name).exists()):

		return Response(

			{
				"status": "failed",

				"message": "Une boutique existe déja avec ces informations."
			},

			status=status.HTTP_200_OK
		)

	try:

		user = request.user

		shop = Shop.objects.create(

			shop_name=shop_name,

			shop_category=shop_category,

			wa_num=wa_num,

			location=location,

			owner=user


		)

		user.ver_code = gen_code(user)

		user.save()

		user = authenticate(username=username, password=password)

		login(request, user)

		return Response(

			{
				"status": "created",

				"message": "User created successfully"

			},

			status=status.HTTP_201_CREATED
		)

	except Exception as e:

		return Response(


			{
				"status": "error",

				"message": str(e)
			},

			status=status.HTTP_500_INTERNAL_SERVER_ERROR
		)

@api_view(["POST"])

def login_view(request):

	username = request.data.get("username")

	password = request.data.get("password")

	if not username or not password:

		return Response(

			{"status": "error", "message": "Le nom d'utilisateur et le mot de passe sont obligatoir"},

			status=status.HTTP_400_BAD_REQUEST
		)

	user = authenticate(username=username, password=password)
 
	if user is not None:

		login(request, user)

		return Response(

			{
				"status": "ok",

				"message": "Login successful",
			},

			status=status.HTTP_200_OK
		)

	else:

		return Response(

			{"status": "error", "message": "informations incorrectes"},

			status=status.HTTP_401_UNAUTHORIZED
		)



def user_logout(request):

	try:
	
		logout(request)

		return Response({

			"status":"ok",

			"message":"User logout successfully"
			},

		status=status.HTTP_200_OK
	)

	except Exception as e:

		return Response({

			"status":"error",

			"message": str(e)
			},

		status=status.HTTP_500_INTERNAL_SERVER_ERROR
	)