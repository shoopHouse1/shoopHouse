import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminProducts() {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  const { data, refetch } = useQuery({
    queryKey: ['admin-products', statusFilter],
    queryFn: () => {
      let url = '/admin/products';
      if (statusFilter && statusFilter !== 'ALL') {
        url += `?status=${statusFilter}`;
      }
      return api.get<{ data: any[]; pagination: any }>(url);
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/products/${id}/approve`),
    onSuccess: () => refetch(),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/products/${id}/reject`),
    onSuccess: () => refetch(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/products/${id}`),
    onSuccess: () => refetch(),
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Product Management</h1>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-4">
        {data?.data?.map((product: any) => (
          <Card key={product.id}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-shrink-0">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0].url} 
                      alt={product.titleEn}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center">
                      <span className="text-gray-500 text-sm">No Image</span>
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg">{product.titleEn}</h3>
                  <p className="text-muted-foreground">{product.titleAr}</p>
                  <p className="font-bold text-primary">${product.price}</p>
                  <p className="text-sm mt-1">
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
                  <p className="text-sm mt-1">
                    <span className="font-medium">Seller:</span> {product.seller?.user?.name || 'N/A'}
                  </p>
                  <p className="text-sm mt-1">
                    <span className="font-medium">Category:</span> {product.category?.nameEn || 'N/A'}
                  </p>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {product.status === 'PENDING_APPROVAL' && (
                      <>
                        <Button 
                          onClick={() => approveMutation.mutate(product.id)}
                          disabled={approveMutation.isPending}
                        >
                          {approveMutation.isPending ? 'Approving...' : 'Approve'}
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => rejectMutation.mutate(product.id)}
                          disabled={rejectMutation.isPending}
                        >
                          {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete the product "${product.titleEn}"? This action cannot be undone.`)) {
                              deleteMutation.mutate(product.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? 'Deleting...' : 'Delete Product'}
                        </Button>
                      </>
                    )}
                    
                    {(product.status === 'PUBLISHED' || product.status === 'REJECTED') && (
                      <>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            // Allow admin to change status back to pending approval if needed
                            if (window.confirm('Are you sure you want to change this product back to pending approval?')) {
                              // This would require a new endpoint to reset the status
                              // For now, we'll just show a placeholder
                            }
                          }}
                        >
                          Reset Status
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            // Edit product functionality
                            window.location.href = `/admin/products/${product.id}/edit`;
                          }}
                        >
                          Edit Product
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete the product "${product.titleEn}"? This action cannot be undone.`)) {
                              deleteMutation.mutate(product.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? 'Deleting...' : 'Delete Product'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {data?.data && data.data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No products found matching the selected criteria.
          </div>
        )}
      </div>
    </div>
  );
}