import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

export default function SellerProducts() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['seller-products'],
    queryFn: () => api.get<{ data: any[] }>('/seller/products'),
  });
  
  const submitMutation = useMutation({
    mutationFn: (productId: string) => api.post(`/seller/products/${productId}/submit`),
    onSuccess: () => {
      refetch();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Products</h1>
        <Link to="/seller/products/new">
          <Button>Create Product</Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data?.data?.map((product: any) => (
          <Card key={product.id}>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">{product.titleEn}</h3>
              <p className="text-primary font-bold mb-4">{formatPrice(product.price)}</p>
              <p className="text-sm mb-4">
                <span className="font-medium">Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  product.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                  product.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-800' :
                  product.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {product.status.replace('_', ' ')}
                </span>
              </p>
              <div className="flex flex-col gap-2">
                <Link to={`/seller/products/${product.id}/edit`}>
                  <Button variant="outline" className="w-full">Edit</Button>
                </Link>
                {product.status === 'DRAFT' && (
                  <Button 
                    onClick={() => submitMutation.mutate(product.id)}
                    disabled={submitMutation.isPending}
                    className="w-full"
                  >
                    {submitMutation.isPending ? 'Submitting...' : 'Submit for Approval'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


