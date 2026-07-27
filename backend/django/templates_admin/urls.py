from django.urls import path
from .views import (
    admin_login_view,
    admin_logout_view,
    admin_dashboard_view,
    admin_products_view,
    admin_orders_view
)

urlpatterns = [
    path('login/', admin_login_view, name='admin_login'),
    path('logout/', admin_logout_view, name='admin_logout'),
    path('dashboard/', admin_dashboard_view, name='admin_dashboard'),
    path('products/', admin_products_view, name='admin_products'),
    path('orders/', admin_orders_view, name='admin_orders'),
]
