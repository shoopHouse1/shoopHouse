import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createProductSchema } from '@shoophouse/shared';

export default function CreateProduct() {
  const navigate = useNavigate();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<{ data: any[] }>('/products/categories'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createProductSchema),
  });

  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return api.post('/seller/products', formData);
    },
    onSuccess: () => {
      navigate('/seller/products');
    },
    onError: (error) => {
      console.error('Error creating product:', error);
      alert('Error creating product: ' + (error as any)?.message || 'Unknown error');
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedImages(files);
      
      // Create previews for the selected images
      const previews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const removeImage = (index: number) => {
    const newSelectedImages = [...selectedImages];
    newSelectedImages.splice(index, 1);
    setSelectedImages(newSelectedImages);
    
    const newImagePreviews = [...imagePreviews];
    newImagePreviews.splice(index, 1);
    setImagePreviews(newImagePreviews);
  };

  const onSubmit = async (data: any) => {
    const formData = new FormData();
    
    // Add form fields (excluding tags)
    Object.keys(data).forEach(key => {
      const value = data[key];
      const isEmptyString = typeof value === 'string' && value.trim() === '';
      const isInvalidNumber = typeof value === 'number' && Number.isNaN(value);

      if (key !== 'tags' && value !== undefined && value !== null && !isEmptyString && !isInvalidNumber) {
        formData.append(key, value);
      }
    });
    
    // Add images
    selectedImages.forEach((image) => {
      formData.append('images', image);
    });
    
    createMutation.mutate(formData);
  };



  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create Product</h1>
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label>English Title</label>
              <Input {...register('titleEn')} />
              {errors.titleEn && <p className="text-destructive text-sm">{errors.titleEn.message as string}</p>}
            </div>
            
            <div>
              <label>Arabic Title</label>
              <Input {...register('titleAr')} />
              {errors.titleAr && <p className="text-destructive text-sm">{errors.titleAr.message as string}</p>}
            </div>
            
            <div>
              <label>English Description</label>
              <Input {...register('descriptionEn')} />
            </div>
            
            <div>
              <label>Arabic Description</label>
              <Input {...register('descriptionAr')} />
              {errors.descriptionAr && <p className="text-destructive text-sm">{errors.descriptionAr.message as string}</p>}
            </div>

            <div>
              <label>Price</label>
              <Input type="number" step="0.01" {...register('price', { valueAsNumber: true })} />
              {errors.price && <p className="text-destructive text-sm">{errors.price.message as string}</p>}
            </div>
            
            <div>
              <label>Category</label>
              {categoriesLoading ? (
                <p>Loading categories...</p>
              ) : (
                <select
                  {...register('categoryId', { required: 'Category is required' })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select a category</option>
                  {categories?.data?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.nameEn} ({category.nameAr})
                    </option>
                  ))}
                </select>
              )}
              {errors.categoryId && <p className="text-destructive text-sm">{errors.categoryId.message as string}</p>}
            </div>
            
            <div>
              <label>Product Images</label>
              <Input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageChange}
                multiple
                accept="image/*"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose Images
              </Button>
              <p className="text-sm text-muted-foreground mt-1">Select one or more images for your product</p>
              
              {/* Image previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={preview} 
                        alt={`Preview ${index + 1}`} 
                        className="w-full h-32 object-cover rounded-md border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Product'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
