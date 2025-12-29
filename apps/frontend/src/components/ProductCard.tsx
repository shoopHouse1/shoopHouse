import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Heart } from 'lucide-react';

interface ProductCardProps {
  title: string;
  description: string;
  price: number;
  rating: number;
  category: string;
  images?: { url: string }[];
}

export default function ProductCard({ title, description, price, rating, category, images }: ProductCardProps) {
  const cardVariants = {
    rest: { 
      scale: 1,
      y: 0,
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
    },
    hover: { 
      scale: 1.02,
      y: -5,
      boxShadow: '0 4px 12px 0 rgb(0 0 0 / 0.15), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
    }
  };

  // Function to get image based on product title
  const getImageForProduct = () => {
    if (images && images.length > 0) {
      return images[0].url;
    }
    
    // Map product titles to specific images
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('chatgpt') || titleLower.includes('gpt')) {
      return '/images/chatGpt.png';
    } else if (titleLower.includes('claude') || titleLower.includes('pro')) {
      return '/images/Claude Pro.png';
    } else if (titleLower.includes('gemini')) {
      return '/images/Gemini Pro.png';
    } else if (titleLower.includes('github')) {
      return '/images/GitHub Pro.png';
    } else if (titleLower.includes('google') && titleLower.includes('premium')) {
      return '/images/GooglePremium.png';
    } else if (titleLower.includes('microsoft')) {
      return '/images/Microsoft 365.png';
    } else if (titleLower.includes('midjourney')) {
      return '/images/Midjourney Pro.png';
    } else if (titleLower.includes('netflix')) {
      return '/images/Netflix Premium.png';
    }
    
    // Default fallback
    return '/images/GooglePremium.png'; // or a generic image
  };
  
  const productImage = getImageForProduct();
  
  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      initial="rest"
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }}
    >
      <Card className="p-6 overflow-hidden group">
        <div className="relative mb-4">
          <div className="bg-secondary rounded-lg h-48 flex items-center justify-center overflow-hidden">
            <img 
              src={productImage} 
              alt={title}
              className="object-contain w-full h-full p-4"
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite loop
                target.src = '/images/GooglePremium.png'; // Generic fallback
              }}
            />
          </div>
          
          <motion.div 
            className="absolute top-3 right-3"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button size="icon" variant="outline" className="rounded-full">
              <Heart className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
        
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{title}</h3>
          <Badge variant="secondary">{category}</Badge>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-primary text-primary" />
            <span className="text-sm font-medium">{rating}</span>
          </div>
          <span className="text-lg font-bold">${price.toFixed(2)}</span>
        </div>
        
        <div className="flex gap-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button className="w-full">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" size="icon">
              <Heart className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}