import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice, formatDate } from '@/lib/utils';

export default function OrderDetail() {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get<{ order: any }>(`/orders/${id}`),
    enabled: !!id,
  });

  const { data: whatsappLink } = useQuery({
    queryKey: ['whatsapp-link', id],
    queryFn: () => api.get<{ whatsappUrl: string }>(`/orders/${id}/whatsapp-link`),
    enabled: !!id && data?.order?.status === 'PENDING_PAYMENT',
  });

  if (isLoading) return <div>Loading...</div>;
  if (!data?.order) return <div>Order not found</div>;

  const order = data.order;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Order {order.orderNumber}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            <div className="space-y-2">
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Date:</strong> {formatDate(order.createdAt)}</p>
              <p><strong>Total:</strong> {formatPrice(order.total)}</p>
            </div>
            {order.status === 'PENDING_PAYMENT' && whatsappLink && (
              <a href={whatsappLink.whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button className="mt-4 w-full">Pay via WhatsApp</Button>
              </a>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Items</h2>
            <div className="space-y-4">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <p className="font-semibold">{item.product.titleEn}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p>{formatPrice(item.priceAtPurchase * item.quantity)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


