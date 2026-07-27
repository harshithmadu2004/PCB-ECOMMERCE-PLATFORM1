from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Order
from .serializers import OrderSerializer

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.role in ['admin', 'staff'] or user.is_superuser:
            return Order.objects.all().order_by('-created_at')
        return Order.objects.filter(user=user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def approve(self, request, pk=None):
        order = self.get_object()
        if not (request.user.role in ['admin', 'staff'] or request.user.is_staff or request.user.is_superuser):
            return Response({'detail': 'Only admin/staff can approve orders.'}, status=status.HTTP_403_FORBIDDEN)
        order.status = 'APPROVED'
        order.save()
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reject(self, request, pk=None):
        order = self.get_object()
        if not (request.user.role in ['admin', 'staff'] or request.user.is_staff or request.user.is_superuser):
            return Response({'detail': 'Only admin/staff can reject orders.'}, status=status.HTTP_403_FORBIDDEN)
        order.status = 'REJECTED'
        order.save()
        return Response(OrderSerializer(order).data)
