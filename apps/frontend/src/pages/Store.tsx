import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart';
import { mockProducts } from '@/data/mockProducts';

export default function Store() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { addItem } = useCartStore();

  const { data, isLoading } = useQuery({
    queryKey: ['products', search, page],
    queryFn: async () => {
      try {
        const response = await api.get<{ data: any[]; pagination: any }>(
          `/products?search=${search}&page=${page}&limit=20`
        );
        return response;
      } catch (error) {
        // If API fails, return filtered mock data
        console.log('Using mock data for store');
        let filtered = [...mockProducts];
        if (search) {
          filtered = mockProducts.filter(
            (p) =>
              p.titleEn.toLowerCase().includes(search.toLowerCase()) ||
              p.titleAr.includes(search) ||
              p.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
          );
        }
        return {
          data: filtered,
          pagination: {
            page: 1,
            limit: 20,
            total: filtered.length,
            totalPages: 1,
          },
        };
      }
    },
  });

  const handleAddToCart = (product: any) => {
    addItem({
      productId: product.id,
      title: product.titleEn,
      price: product.price,
      image: product.images?.[0]?.url,
    });
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Store</h1>
        <div className="flex gap-4">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data?.data?.map((product: any) => (
          <Card key={product.id} className="overflow-hidden">
            <Link to={`/product/${product.slug}`}>
              <div className="aspect-video bg-muted">
                {product.images?.[0] && (
                  <img
                    src={product.images[0].url}
                    alt={product.titleEn}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </Link>
            <CardContent className="p-4">
              <Link to={`/product/${product.slug}`}>
                <h3 className="font-semibold mb-2">{product.titleEn}</h3>
              </Link>
              <p className="text-primary font-bold mb-4">{formatPrice(product.price)}</p>
              <Button
                onClick={() => handleAddToCart(product)}
                className="w-full"
              >
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {data?.pagination && (
        <div className="mt-8 flex justify-center gap-2">
          <Button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="px-4 py-2">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <Button
            disabled={page >= data.pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

