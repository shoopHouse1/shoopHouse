import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateProductSchema } from '@shoophouse/shared';
import { ProductStatus } from '@shoophouse/shared';
import { motion } from 'framer-motion';
import { AlertTriangle, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useEffect, useState } from 'react';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: product } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get<any>(`/seller/products/${id}`).then((res: any) => res.data),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(updateProductSchema),
    values: product || {},
  });

  // Set form values when product data loads
  useEffect(() => {
    if (product) {
      setValue('titleEn', product.titleEn);
      setValue('descriptionEn', product.descriptionEn);
      setValue('price', product.price);
      setValue('status', product.status);
    }
  }, [product, setValue]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put(`/seller/products/${id}`, data),
    onSuccess: () => {
      navigate('/seller/products');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/seller/products/${id}`),
    onSuccess: () => {
      navigate('/seller/products');
    },
  });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const onSubmit = (data: any) => {
    updateMutation.mutate(data);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleteMutation.isPending}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Product
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">English Title</label>
                <Input {...register('titleEn')} />
                {errors.titleEn && (
                  <p className="text-sm text-destructive mt-1">{errors.titleEn.message as string}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">English Description</label>
                <Textarea {...register('descriptionEn')} />
                {errors.descriptionEn && (
                  <p className="text-sm text-destructive mt-1">{errors.descriptionEn.message as string}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Price ($)</label>
                <Input type="number" step="0.01" {...register('price', { valueAsNumber: true })} />
                {errors.price && (
                  <p className="text-sm text-destructive mt-1">{errors.price.message as string}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <Select value={watch('status')} onValueChange={(value) => setValue('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ProductStatus.DRAFT}>Draft</SelectItem>
                    <SelectItem value={ProductStatus.PENDING_APPROVAL}>Pending Approval</SelectItem>
                    <SelectItem value={ProductStatus.PUBLISHED}>Published</SelectItem>
                    <SelectItem value={ProductStatus.REJECTED}>Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Updating...' : 'Update Product'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/seller/products')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete Product
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone and will permanently remove the product and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


