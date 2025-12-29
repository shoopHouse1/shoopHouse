import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { mockProducts } from '@/data/mockProducts';

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      try {
        const response = await api.get<any>(`/products/${slug}`);
        return response;
      } catch (error) {
        // If API fails, find product in mock data
        console.log('Using mock data for product');
        const mockProduct = mockProducts.find((p) => p.slug === slug);
        if (mockProduct) {
          return {
            ...mockProduct,
            reviews: [
              {
                id: '1',
                rating: 5,
                comment: 'Great product! Highly recommended.',
                buyer: { name: 'John Doe' },
                createdAt: new Date().toISOString(),
              },
              {
                id: '2',
                rating: 4,
                comment: 'Good quality, worth the price.',
                buyer: { name: 'Jane Smith' },
                createdAt: new Date().toISOString(),
              },
            ],
          };
        }
        throw error;
      }
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-8">Product not found</div>;
  }

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      title: product.titleEn,
      price: product.price,
      image: product.images?.[0]?.url,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {product.images?.[0] && (
            <img
              src={product.images[0].url}
              alt={product.titleEn}
              className="w-full rounded-lg"
            />
          )}
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-4">{product.titleEn}</h1>
          <p className="text-3xl text-primary font-bold mb-4">
            {formatPrice(product.price)}
          </p>
          <p className="text-muted-foreground mb-6">{product.descriptionEn}</p>
          <Button onClick={handleAddToCart} size="lg" className="w-full mb-4">
            Add to Cart
          </Button>
          {isAuthenticated() && (
            <Link to="/checkout">
              <Button variant="outline" size="lg" className="w-full">
                Buy Now
              </Button>
            </Link>
          )}

          {product.reviews && product.reviews.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Reviews</h2>
              <div className="space-y-4">
                {product.reviews.map((review: any) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{review.buyer.name}</span>
                        <span className="text-yellow-500">
                          {'★'.repeat(review.rating)}
                        </span>
                      </div>
                      <p>{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

