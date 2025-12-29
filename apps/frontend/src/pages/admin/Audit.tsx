import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

export default function AdminAudit() {
  const { data } = useQuery({
    queryKey: ['admin-audit'],
    queryFn: () => api.get<{ data: any[] }>('/admin/audit'),
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Audit Logs</h1>
      <div className="space-y-4">
        {data?.data?.map((log: any) => (
          <Card key={log.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{log.action}</h3>
                  <p className="text-muted-foreground">
                    {log.actor.name} ({log.actor.email})
                  </p>
                  <p className="text-sm">
                    {log.entityType} {log.entityId}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDate(log.createdAt)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


