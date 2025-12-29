import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-kpis'],
    queryFn: () => api.get<{ kpis: any }>('/admin/kpis'),
  });

  if (isLoading) return <div>Loading...</div>;

  const kpis = data?.kpis;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Total Users</h3>
            <p className="text-3xl font-bold">{kpis?.totalUsers || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Total Sellers</h3>
            <p className="text-3xl font-bold">{kpis?.totalSellers || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Total Products</h3>
            <p className="text-3xl font-bold">{kpis?.totalProducts || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold">${kpis?.totalRevenue?.toFixed(2) || '0.00'}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


