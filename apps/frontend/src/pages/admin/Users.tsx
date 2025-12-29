import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';


export default function AdminUsers() {
  const { data, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get<{ data: any[] }>('/admin/users'),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      api.patch(`/admin/users/${id}/role`, { role }),
    onSuccess: () => {
      refetch();
    },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Users</h1>
      <div className="space-y-4">
        {data?.data?.map((user: any) => (
          <Card key={user.id}>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-muted-foreground">{user.email}</p>
                <p className="text-sm">Role: {user.role}</p>
              </div>
              <select
                value={user.role}
                onChange={(e) =>
                  updateRoleMutation.mutate({ id: user.id, role: e.target.value })
                }
                className="px-3 py-2 border rounded-md"
              >
                <option value="BUYER">BUYER</option>
                <option value="SELLER">SELLER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


