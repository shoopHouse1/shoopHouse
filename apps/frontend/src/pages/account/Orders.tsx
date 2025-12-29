import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { formatPrice, formatDate } from '@/lib/utils';

export default function Orders() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.get<{ data: any[] }>('/orders'),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      <div className="space-y-4">
        {data?.data?.map((order: any) => (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <Link to={`/account/orders/${order.id}`}>
                    <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                  </Link>
                  <p className="text-muted-foreground">{formatDate(order.createdAt)}</p>
                  <p className="mt-2">
                    <span className="capitalize">{order.status.toLowerCase().replace('_', ' ')}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{formatPrice(order.total)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


