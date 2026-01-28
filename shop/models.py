from django.db import models

from django.contrib.auth.models import User

class Shop(models.Model):

    CATEGORY_CHOICES = [

        ('fashion', 'Mode & Vêtements'),
        ('electronics', 'Électronique'),
        ('food', 'Alimentation & Boissons'),
        ('beauty', 'Beauté & Cosmétiques'),
        ('home', 'Maison & Jardin'),
        ('sports', 'Sports & Fitness'),
        ('books', 'Livres & Fournitures'),
        ('toys', 'Jouets & Jeux'),
        ('jewelry', 'Bijoux & Accessoires'),
        ('health', 'Santé & Bien-être'),
        ('automotive', 'Automobile'),
        ('arts', 'Art & Artisanat'),
        ('other', 'Autre'),
    ]

    shop_name = models.CharField(max_length=100, verbose_name="Nom de la boutique")

    shop_category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, verbose_name="Catégorie")

    wa_num = models.CharField(max_length=20, verbose_name="Numéro WhatsApp")

    location = models.CharField(max_length=100, verbose_name="Localisation")

    owner = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Propriétaire")

    shop_id = models.CharField(max_length=100, verbose_name="id de la boutique")

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")

    updated_at = models.DateTimeField(auto_now=True, verbose_name="Mis à jour le")

    def __str__(self):

        return self.shop_name

class Product(models.Model):

    name = models.CharField(max_length=100, verbose_name="Nom du produit")

    description = models.TextField(verbose_name="Description")

    category = models.CharField(max_length=50, verbose_name="Catégorie")

    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name="products", verbose_name="Boutique")

    image = models.JSONField(default=list) 

    price = models.CharField(max_length=16, verbose_name="prix du produit", default="O")

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")

    updated_at = models.DateTimeField(auto_now=True, verbose_name="Mis à jour le")

    def __str__(self):

        return f"{self.name} ({self.shop.shop_name})"


class ShopHistory(models.Model):

    shop = models.ForeignKey(Shop, verbose_name="Boutique", on_delete=models.CASCADE)

    old_shop_name = models.CharField(max_length=100)

    def __str__(self):

        return f'{self.shop} {self.old_shop_name}'