import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [orderId, setOrderId] = useState<string | null>(null);

  const createOrderMutation = useMutation({
    mutationFn: (data: any) => api.post('/orders', data),
    onSuccess: (data: any) => {
      setOrderId(data.order.id);
      clearCart();
    },
  });

  const { data: whatsappLink } = useQuery({
    queryKey: ['whatsapp-link', orderId],
    queryFn: () => api.get<{ whatsappUrl: string }>(`/orders/${orderId}/whatsapp-link`),
    enabled: !!orderId,
  });

  const handleCheckout = () => {
    if (!isAuthenticated()) {
      navigate('/auth/login');
      return;
    }

    const orderItems = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    createOrderMutation.mutate({ items: orderItems });
  };

  if (!orderId && items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <Button onClick={() => navigate('/store')}>Browse Products</Button>
      </div>
    );
  }

  if (orderId && whatsappLink) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <h1 className="text-3xl font-bold mb-4">Order Created!</h1>
            <p className="text-muted-foreground mb-6">
              Click the button below to pay via WhatsApp
            </p>
            <a
              href={whatsappLink.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="w-full">
                Pay via WhatsApp
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between">
                    <span>{item.title} x{item.quantity}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-4">
                <span>Total</span>
                <span>{formatPrice(getTotal())}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="p-6">
              <Button
                onClick={handleCheckout}
                size="lg"
                className="w-full"
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? 'Creating Order...' : 'Create Order'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


