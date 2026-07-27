from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=200)
    sku = models.CharField(max_length=50, unique=True)
    description = models.TextField()
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    max_layers = models.IntegerField(default=4)
    material = models.CharField(max_length=50, default='FR-4 Standard TG130-140')
    surface_finish = models.CharField(max_length=50, default='HASL with lead')
    stock = models.IntegerField(default=100)
    image_url = models.URLField(blank=True, default='')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.sku})"
