from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.db.models import Sum
from products.models import Product
from orders.models import Order, OrderItem

def is_admin_check(user):
    return user.is_authenticated and (user.role in ['admin', 'staff'] or user.is_staff or user.is_superuser)

def admin_login_view(request):
    if request.user.is_authenticated and is_admin_check(request.user):
        return redirect('/admin/dashboard/')
    
    if request.method == 'POST':
        u = request.POST.get('username')
        p = request.POST.get('password')
        user = authenticate(request, username=u, password=p)
        if user is not None and is_admin_check(user):
            login(request, user)
            return redirect('/admin/dashboard/')
        else:
            messages.error(request, "Invalid credentials or unauthorized role for Admin Access.")
    return render(request, 'templates_admin/login.html')

def admin_logout_view(request):
    logout(request)
    return redirect('/admin/login/')

@login_required(login_url='/admin/login/')
@user_passes_test(is_admin_check, login_url='/admin/login/')
def admin_dashboard_view(request):
    total_orders = Order.objects.count()
    pending_orders = Order.objects.filter(status='PENDING').count()
    approved_orders = Order.objects.filter(status='APPROVED').count()
    rejected_orders = Order.objects.filter(status='REJECTED').count()
    product_count = Product.objects.count()
    
    total_revenue = Order.objects.filter(status__in=['APPROVED', 'SHIPPED', 'COMPLETED']).aggregate(Sum('total_amount'))['total_amount__sum'] or 0.00
    recent_orders = Order.objects.all().order_by('-created_at')[:5]

    context = {
        'total_orders': total_orders,
        'pending_orders': pending_orders,
        'approved_orders': approved_orders,
        'rejected_orders': rejected_orders,
        'product_count': product_count,
        'total_revenue': total_revenue,
        'recent_orders': recent_orders,
    }
    return render(request, 'templates_admin/dashboard.html', context)

@login_required(login_url='/admin/login/')
@user_passes_test(is_admin_check, login_url='/admin/login/')
def admin_products_view(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        sku = request.POST.get('sku')
        description = request.POST.get('description')
        base_price = request.POST.get('base_price')
        max_layers = request.POST.get('max_layers', 4)
        material = request.POST.get('material', 'FR-4')
        surface_finish = request.POST.get('surface_finish', 'HASL')
        stock = request.POST.get('stock', 100)

        Product.objects.create(
            name=name,
            sku=sku,
            description=description,
            base_price=base_price,
            max_layers=max_layers,
            material=material,
            surface_finish=surface_finish,
            stock=stock
        )
        messages.success(request, f"Product '{name}' added successfully.")
        return redirect('/admin/products/')

    products_list = Product.objects.all().order_by('-created_at')
    return render(request, 'templates_admin/products.html', {'products': products_list})

@login_required(login_url='/admin/login/')
@user_passes_test(is_admin_check, login_url='/admin/login/')
def admin_orders_view(request):
    if request.method == 'POST':
        order_id = request.POST.get('order_id')
        action = request.POST.get('action')
        order = get_object_or_404(Order, id=order_id)
        if action == 'approve':
            order.status = 'APPROVED'
            order.save()
            messages.success(request, f"Order #{order.id} approved successfully.")
        elif action == 'reject':
            order.status = 'REJECTED'
            order.save()
            messages.warning(request, f"Order #{order.id} rejected.")
        return redirect('/admin/orders/')

    orders_list = Order.objects.all().order_by('-created_at')
    return render(request, 'templates_admin/orders.html', {'orders': orders_list})
