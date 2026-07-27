import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pcb_django.settings')
django.setup()

from authentication.models import User
from products.models import Product
from orders.models import Order, OrderItem

def seed_data():
    print("Running initial database seed...")
    
    # 1. Create Users
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@pcbdirect.com',
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        admin_user.set_password('adminpassword')
        admin_user.save()
        print("Created admin user (username: admin / pass: adminpassword)")

    customer_user, created = User.objects.get_or_create(
        username='customer1',
        defaults={
            'email': 'john.doe@example.com',
            'role': 'customer',
            'company_name': 'Robotics Corp'
        }
    )
    if created:
        customer_user.set_password('customerpassword')
        customer_user.save()
        print("Created customer user (username: customer1 / pass: customerpassword)")

    # 2. Create Products
    products_data = [
        {
            'name': '2-Layer Standard Prototyping PCB',
            'sku': 'PCB-2L-STD',
            'description': 'High reliability FR-4 substrate standard 2-layer PCB suitable for general hardware prototyping.',
            'base_price': 15.00,
            'max_layers': 2,
            'material': 'FR-4 Standard TG130-140',
            'surface_finish': 'HASL with lead',
            'stock': 500,
            'image_url': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80'
        },
        {
            'name': '4-Layer High-Speed Impedance Control PCB',
            'sku': 'PCB-4L-IMP',
            'description': '4-layer stackup with controlled differential impedance traces for USB 3.0 and high-speed processors.',
            'base_price': 45.00,
            'max_layers': 4,
            'material': 'FR-4 High TG170',
            'surface_finish': 'ENIG (Electroless Nickel Immersion Gold)',
            'stock': 300,
            'image_url': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'
        },
        {
            'name': '6-Layer HDI Microvia Board',
            'sku': 'PCB-6L-HDI',
            'description': 'High Density Interconnect 6-layer board with laser drilled microvias and fine pitch BGA fanout.',
            'base_price': 120.00,
            'max_layers': 6,
            'material': 'Rogers RO4350B / FR4 Hybrid',
            'surface_finish': 'ENIG (Electroless Nickel Immersion Gold)',
            'stock': 150,
            'image_url': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80'
        },
        {
            'name': 'Aluminum Substrate Thermal LED PCB',
            'sku': 'PCB-1L-ALU',
            'description': 'Metal core aluminum PCB designed for high power LED matrices and thermal dissipation arrays.',
            'base_price': 25.00,
            'max_layers': 1,
            'material': 'Aluminum Core 1.6mm',
            'surface_finish': 'HASL Lead Free',
            'stock': 200,
            'image_url': 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80'
        },
    ]

    for pdata in products_data:
        Product.objects.get_or_create(sku=pdata['sku'], defaults=pdata)

    print("Seeded PCB products catalog.")

    # 3. Create Sample Order
    if not Order.objects.exists():
        prod = Product.objects.first()
        order = Order.objects.create(
            user=customer_user,
            status='PENDING',
            total_amount=60.00,
            shipping_address='123 Tech Blvd, Silicon Valley, CA 94025',
            notes='Please expedite surface finish ENIG treatment.'
        )
        OrderItem.objects.create(
            order=order,
            product=prod,
            product_name=prod.name,
            quantity=4,
            price_at_purchase=15.00,
            pcb_specs={'layers': 2, 'thickness': '1.6mm', 'solder_mask': 'Green'}
        )
        print("Created sample order for customer1.")

if __name__ == '__main__':
    seed_data()
