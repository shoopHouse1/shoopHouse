import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

export default function AdminTickets() {
  const { data } = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: () => api.get<{ data: any[] }>('/admin/tickets'),
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Support Tickets</h1>
      <div className="space-y-4">
        {data?.data?.map((ticket: any) => (
          <Card key={ticket.id}>
            <CardContent className="p-6">
              <h3 className="font-semibold">{ticket.subject}</h3>
              <p className="text-muted-foreground">{ticket.buyer.name}</p>
              <p className="text-sm">{formatDate(ticket.createdAt)}</p>
              <p className="text-sm">Status: {ticket.status}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


