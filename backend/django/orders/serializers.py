from rest_framework import serializers
from .models import Order, OrderItem
from products.serializers import ProductSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = (
            "id",
            "product",
            "product_name",
            "quantity",
            "price_at_purchase",
            "pcb_specs",
        )


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, required=False)
    customer_username = serializers.CharField(source="user.username", read_only=True)
    customer_email = serializers.CharField(source="user.email", read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "user",
            "customer_username",
            "customer_email",
            "status",
            "total_amount",
            "shipping_address",
            "notes",
            "created_at",
            "updated_at",
            "items",
        )
        read_only_fields = ("user", "created_at", "updated_at")

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])

        order = Order.objects.create(**validated_data)

        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)

        return order