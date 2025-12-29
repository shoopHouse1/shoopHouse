import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

export default function Downloads() {
  const { data, isLoading } = useQuery({
    queryKey: ['downloads'],
    queryFn: () => api.get<{ data: any[] }>('/downloads'),
  });

  const handleDownload = async (token: string) => {
    const response = await api.get<{ downloadUrl: string }>(`/downloads/${token}`);
    window.open(response.downloadUrl, '_blank');
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Downloads</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.data?.map((download: any) => (
          <Card key={download.token}>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">{download.product.titleEn}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Order: {download.orderNumber}
              </p>
              <div className="flex justify-between items-center">
                <div className="text-sm">
                  <p>Expires: {formatDate(download.expiresAt)}</p>
                  <p>Remaining: {download.remainingDownloads}</p>
                </div>
                <Button
                  onClick={() => handleDownload(download.token)}
                  disabled={download.remainingDownloads <= 0}
                >
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


