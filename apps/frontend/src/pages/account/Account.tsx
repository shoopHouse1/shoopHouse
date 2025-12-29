import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth';

export default function Account() {
  const { user } = useAuthStore();

  const { data } = useQuery({
    queryKey: ['user'],
    queryFn: () => api.get<any>('/auth/me'),
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Account</h1>
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          <div className="space-y-2">
            <p><strong>Name:</strong> {data?.user?.name || user?.name}</p>
            <p><strong>Email:</strong> {data?.user?.email || user?.email}</p>
            <p><strong>Role:</strong> {data?.user?.role || user?.role}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


