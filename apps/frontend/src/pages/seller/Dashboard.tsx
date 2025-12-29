import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';

export default function SellerDashboard() {
  const { data } = useQuery({
    queryKey: ['seller-profile'],
    queryFn: () => api.get<any>('/seller/me'),
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Seller Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Status</h3>
            <p className="text-2xl">{data?.profile?.status || 'N/A'}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


