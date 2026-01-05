import React from 'react';
import { Zap } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useStore } from '@/contexts/StoreContext';

export const FlashDeals: React.FC = () => {
  const { products } = useStore();
  const flashDeals = products.filter(p => p.isFlashDeal);

  if (flashDeals.length === 0) return null;

  return (
    <section className="py-6 animate-slide-up">
      <div className="bg-gradient-deal rounded-2xl p-4 md:p-6 shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary-foreground/20 rounded-full flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary-foreground animate-bounce-subtle" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-primary-foreground">
              Flash Deals
            </h2>
            <p className="text-primary-foreground/80 text-sm">Ofertas especiais!</p>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {flashDeals.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
