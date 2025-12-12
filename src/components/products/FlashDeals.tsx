import React, { useState, useEffect } from 'react';
import { Zap, Clock } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useStore } from '@/contexts/StoreContext';

export const FlashDeals: React.FC = () => {
  const { products } = useStore();
  const flashDeals = products.filter(p => p.isFlashDeal);
  
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 42,
    seconds: 18
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          // Reset timer
          return { hours: 5, minutes: 42, seconds: 18 };
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (flashDeals.length === 0) return null;

  return (
    <section className="py-6 animate-slide-up">
      <div className="bg-gradient-deal rounded-2xl p-4 md:p-6 shadow-lg">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-foreground/20 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground animate-bounce-subtle" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-primary-foreground">
                Flash Deals
              </h2>
              <p className="text-primary-foreground/80 text-sm">Limited time offers!</p>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-2 bg-primary-foreground/20 backdrop-blur-sm rounded-xl px-4 py-2">
            <Clock className="w-5 h-5 text-primary-foreground" />
            <div className="flex items-center gap-1 font-mono font-bold text-primary-foreground">
              <span className="bg-primary-foreground/20 px-2 py-1 rounded">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="bg-primary-foreground/20 px-2 py-1 rounded">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="bg-primary-foreground/20 px-2 py-1 rounded">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
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
