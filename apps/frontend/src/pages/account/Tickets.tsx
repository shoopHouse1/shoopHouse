import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { formatDate } from '@/lib/utils';

export default function Tickets() {
  const { data, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => api.get<{ data: any[] }>('/tickets'),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Support Tickets</h1>
      <div className="space-y-4">
        {data?.data?.map((ticket: any) => (
          <Card key={ticket.id}>
            <CardContent className="p-6">
              <Link to={`/account/tickets/${ticket.id}`}>
                <h3 className="font-semibold text-lg">{ticket.subject}</h3>
              </Link>
              <p className="text-muted-foreground">{formatDate(ticket.createdAt)}</p>
              <p className="mt-2">
                <span className="capitalize">{ticket.status.toLowerCase().replace('_', ' ')}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


