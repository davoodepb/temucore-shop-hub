import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Zap, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore, Product } from '@/contexts/StoreContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useStore();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAdding(true);
    setError(null);

    const result = addToCart(product);
    
    setTimeout(() => {
      setIsAdding(false);
      if (result.success) {
        setIsAdded(true);
        toast({
          title: "Added to cart!",
          description: product.name,
        });
        setTimeout(() => setIsAdded(false), 2000);
      } else {
        setError(result.message);
        setTimeout(() => setError(null), 3000);
      }
    }, 300);
  };

  return (
    <Link to={`/product/${product.id}`}>
      <div className={cn(
        "group bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 animate-fade-in",
        error && "animate-shake"
      )}>
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isFlashDeal && (
              <span className="inline-flex items-center gap-1 bg-gradient-deal text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                <Zap className="w-3 h-3" />
                FLASH
              </span>
            )}
            {discount > 0 && (
              <span className="bg-deal text-deal-foreground text-xs font-bold px-2 py-1 rounded-full">
                -{discount}%
              </span>
            )}
          </div>

          {/* Stock Warning */}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="absolute top-2 right-2 bg-warning text-warning-foreground text-xs font-bold px-2 py-1 rounded-full">
              Only {product.stock} left!
            </span>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <span className="bg-destructive text-destructive-foreground text-sm font-bold px-4 py-2 rounded-full">
                SOLD OUT
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Price */}
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xl font-bold text-primary">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-medium text-sm text-foreground line-clamp-2 mb-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3 h-3",
                    i < Math.floor(product.rating)
                      ? "fill-accent text-accent"
                      : "text-muted"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount.toLocaleString()})
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-xs text-destructive font-medium mb-2 animate-fade-in">
              {error}
            </p>
          )}

          {/* Add to Cart Button */}
          <Button
            variant={isAdded ? "success" : "default"}
            size="sm"
            className="w-full"
            onClick={handleAddToCart}
            disabled={isAdding || product.stock === 0}
          >
            {isAdding ? (
              <span className="animate-pulse">Adding...</span>
            ) : isAdded ? (
              <>
                <Check className="w-4 h-4" />
                Added!
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </div>
    </Link>
  );
};
