import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils';
import { useState } from 'react';

export default function TicketDetail() {
  const { id } = useParams();
  const [message, setMessage] = useState('');

  const { data, refetch } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => api.get<{ ticket: any }>(`/tickets/${id}`),
    enabled: !!id,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data: any) => api.post(`/tickets/${id}/messages`, data),
    onSuccess: () => {
      setMessage('');
      refetch();
    },
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate({ message });
  };

  if (!data?.ticket) return <div>Ticket not found</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{data.ticket.subject}</h1>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4 mb-6">
            {data.ticket.messages?.map((msg: any) => (
              <div key={msg.id} className="border-b pb-4">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">{msg.senderRole}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(msg.createdAt)}
                  </span>
                </div>
                <p>{msg.message}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend} disabled={sendMessageMutation.isPending}>
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


