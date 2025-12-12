import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/layout/Header';
import { ProductCard } from '@/components/products/ProductCard';
import { FlashDeals } from '@/components/products/FlashDeals';
import { useStore } from '@/contexts/StoreContext';
import { Gift, Truck, Shield, HeadphonesIcon } from 'lucide-react';

const Index: React.FC = () => {
  const { products } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products.filter(p => !p.isFlashDeal);
    
    const query = searchQuery.toLowerCase();
    
    if (query === 'flash deals') {
      return products.filter(p => p.isFlashDeal);
    }
    
    return products.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const featuredProducts = products.filter(p => p.isFeatured && !p.isFlashDeal);

  return (
    <>
      <Helmet>
        <title>MegaShop - Amazing Deals on Everything | Up to 90% OFF</title>
        <meta name="description" content="Shop millions of products at unbeatable prices. Free shipping on orders over $35. Flash deals, electronics, fashion, and more!" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header onSearch={setSearchQuery} />

        <main className="container py-6">
          {/* Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'Orders over $35' },
              { icon: Shield, title: 'Secure Payment', desc: '100% Protected' },
              { icon: Gift, title: 'Daily Deals', desc: 'Up to 90% OFF' },
              { icon: HeadphonesIcon, title: '24/7 Support', desc: 'Always here' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 bg-card rounded-xl p-3 shadow-sm">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Flash Deals Section */}
          {!searchQuery && <FlashDeals />}

          {/* Featured Products */}
          {!searchQuery && featuredProducts.length > 0 && (
            <section className="py-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-display font-bold text-foreground">
                  Featured Products
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {featuredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}

          {/* All Products / Search Results */}
          <section className="py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-display font-bold text-foreground">
                {searchQuery ? `Results for "${searchQuery}"` : 'All Products'}
              </h2>
              <span className="text-sm text-muted-foreground">
                {filteredProducts.length} products
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">No products found</p>
                <p className="text-sm text-muted-foreground mt-2">Try a different search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-card border-t border-border mt-12">
          <div className="container py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-deal rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">M</span>
                </div>
                <span className="font-display font-bold text-foreground">
                  Mega<span className="text-primary">Shop</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                © 2024 MegaShop. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
