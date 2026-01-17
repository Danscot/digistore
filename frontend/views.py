from django.shortcuts import render, redirect

from django.contrib.auth.decorators import login_required

from django.contrib.auth import logout

from django.http import JsonResponse

from django.contrib import messages

def index(request):

    return render(request, 'index_fr.html')

def shops(request):

    return render(request, 'shops.html')

def signup(request):

    return render(request, 'signup.html')

def login(request):

    return render(request, 'login.html')

@login_required(login_url="signup")
def dashboard(request):

    return render(request, 'dashboard.html')


@login_required(login_url="login")
def shop(request):

    return render(request, 'my_shop.html')