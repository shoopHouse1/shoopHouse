import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminSellers() {
  const { data, refetch } = useQuery({
    queryKey: ['admin-sellers'],
    queryFn: () => api.get<{ data: any[] }>('/admin/sellers'),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/sellers/${id}/approve`),
    onSuccess: () => refetch(),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/sellers/${id}/reject`),
    onSuccess: () => refetch(),
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Sellers</h1>
      <div className="space-y-4">
        {data?.data?.map((seller: any) => (
          <Card key={seller.id}>
            <CardContent className="p-6">
              <h3 className="font-semibold">{seller.user.name}</h3>
              <p className="text-muted-foreground">{seller.user.email}</p>
              <p className="text-sm">Status: {seller.status}</p>
              {seller.status === 'PENDING' && (
                <div className="mt-4 flex gap-2">
                  <Button onClick={() => approveMutation.mutate(seller.id)}>
                    Approve
                  </Button>
                  <Button variant="destructive" onClick={() => rejectMutation.mutate(seller.id)}>
                    Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


