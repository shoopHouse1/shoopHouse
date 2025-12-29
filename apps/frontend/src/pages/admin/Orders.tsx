import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminOrders() {
  const { data, refetch } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => api.get<{ data: any[] }>('/admin/orders'),
  });

  const markPaidMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/orders/${id}/mark-paid`),
    onSuccess: () => refetch(),
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Orders</h1>
      <div className="space-y-4">
        {data?.data?.map((order: any) => (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{order.orderNumber}</h3>
                  <p className="text-muted-foreground">{formatDate(order.createdAt)}</p>
                  <p className="text-sm">Status: {order.status}</p>
                  <p className="text-sm">Buyer: {order.buyer.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{formatPrice(order.total)}</p>
                  {order.status === 'PENDING_PAYMENT' && (
                    <Button
                      onClick={() => markPaidMutation.mutate(order.id)}
                      className="mt-2"
                    >
                      Mark as Paid
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


