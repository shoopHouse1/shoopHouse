import { Link } from 'react-router-dom';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { mockProducts } from '@/data/mockProducts';

export default function Home() {


  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      try {
        const response = await api.get<{ data: any[]; pagination?: any }>('/products?limit=6');
        return response;
      } catch (error) {
        // If API fails, return mock data
        console.log('Using mock data for products');
        return { data: mockProducts, pagination: { total: mockProducts.length } };
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ShoopHouse
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Premium Digital Files Marketplace
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/store">
                <Button size="lg">Browse Store</Button>
              </Link>
              {/* <Link to="/auth/register">
                <Button size="lg" variant="outline">Start Selling</Button>
              </Link> */}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Products</h2>
          {isLoading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          )}
          {isError && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Unable to load products. The backend server may not be running or database is not set up.
              </p>
              <Link to="/store">
                <Button variant="outline">Browse Store Anyway</Button>
              </Link>
            </div>
          )}
          {!isLoading && !isError && products?.data && products.data.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.data.slice(0, 6).map((product: any, index: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <Link to={`/product/${product.slug}`}>
                      <div className="aspect-video bg-muted">
                        {product.images?.[0]?.url ? (
                          <img
                            src={product.images[0].url}
                            alt={product.titleEn}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            No Image
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{product.titleEn}</h3>
                        <p className="text-primary font-bold">${product.price}</p>
                      </CardContent>
                    </Link>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
          {!isLoading && !isError && (!products?.data || products.data.length === 0) && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No products available yet.</p>
              <Link to="/store">
                <Button variant="outline">Browse Store</Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

