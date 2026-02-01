from django.contrib.auth.models import User

from rest_framework.decorators import api_view, permission_classes

from rest_framework.response import Response

from rest_framework import status

from django.contrib.auth import authenticate, login, logout

from django.shortcuts import redirect

from shop.models import Shop, Product, ShopHistory

import re

import random


def gen_code():

	return random.randint(100000, 999999)

# util function
def normalize_whatsapp_number(number: str) -> str:
    number = number.strip().replace(" ", "")

    # already international
    if number.startswith("+237") and re.fullmatch(r"\+237\d{9}", number):
        return number

    # local cameroon number
    if re.fullmatch(r"\d{9}", number):
        return f"+237{number}"

    raise ValueError("Invalid WhatsApp number")


@api_view(["POST"])
def signin(request):
    data = request.data

    required_fields = [
        "shop_name",
        "shop_category",
        "username",
        "wa_num",
        "location",
        "password",
        "password_2",
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

    if data["password"] != data["password_2"]:
        return Response(
            {
                "status": "failed",
                "message": "Les mots de passe ne correspondent pas",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(username=data["username"]).exists():
        return Response(
            {
                "status": "failed",
                "message": "Ce nom d'utilisateur existe déjà",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if Shop.objects.filter(shop_name=data["shop_name"]).exists():
        return Response(
            {
                "status": "failed",
                "message": "Une boutique avec ce nom existe déjà",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ✅ WhatsApp number normalization
    try:
        wa_num = normalize_whatsapp_number(data["wa_num"])
    except ValueError:
        return Response(
            {
                "status": "failed",
                "message": "Numéro WhatsApp invalide (ex: 670701984 ou +237670701984)",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Create user
    user = User.objects.create_user(
        username=data["username"],
        password=data["password"],
    )

    ver_code = gen_code()

    # Create shop
    shop = Shop.objects.create(
        shop_name=data["shop_name"],
        shop_category=data["shop_category"],
        wa_num=wa_num,  # ✅ normalized number stored
        location=data["location"],
        owner=user,
        shop_id=f"@{data['shop_name'].replace(' ', '_').lower()}",
    )

    login(request, user)

    # Shop history
    ShopHistory.objects.create(
        shop=shop,
        old_shop_name=shop.shop_id,
    )

    return Response(
        {
            "status": "created",
            "message": "Compte et boutique créés avec succès",
            "shop_id": shop.id,
        },
        status=status.HTTP_201_CREATED,
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

	logout(request)

	return redirect("index")

		

@api_view(["GET"])
def check_auth(request):

	if request.user.is_authenticated:

		return Response({"status": "ok"})

	return Response({"status": "unauthorized"}, status=401)
