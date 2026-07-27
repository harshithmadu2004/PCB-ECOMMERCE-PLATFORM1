from django.http import JsonResponse

def home(request):
    return JsonResponse({
        "message": "PCB E-commerce Backend is running"
    })