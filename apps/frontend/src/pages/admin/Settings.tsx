import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function AdminSettings() {
  const { data, refetch } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => api.get<{ settings: any }>('/admin/settings'),
  });

  const [whatsappNumber, setWhatsappNumber] = useState(
    data?.settings?.whatsappNumber || ''
  );

  const updateMutation = useMutation({
    mutationFn: (settings: any) => api.put('/admin/settings', { settings }),
    onSuccess: () => {
      refetch();
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      whatsappNumber,
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block mb-2">WhatsApp Number</label>
              <Input
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+971XXXXXXXXX"
              />
            </div>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


