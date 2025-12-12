import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/layout/Header';
import { ProductCard } from '@/components/products/ProductCard';
import { FlashDeals } from '@/components/products/FlashDeals';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { CookieConsent } from '@/components/common/CookieConsent';
import { useStore } from '@/contexts/StoreContext';
import { Gift, Truck, Shield, HeadphonesIcon, Megaphone, X } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  body: string;
  isPublished: boolean;
  createdAt: string;
}

const Index: React.FC = () => {
  const { products } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([]);
  
  // Get current user for chat
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      setCurrentUser(JSON.parse(saved));
    }

    // Load announcements
    const savedAnnouncements = localStorage.getItem('announcements');
    if (savedAnnouncements) {
      setAnnouncements(JSON.parse(savedAnnouncements));
    }

    const dismissed = localStorage.getItem('dismissed_announcements');
    if (dismissed) {
      setDismissedAnnouncements(JSON.parse(dismissed));
    }
  }, []);

  const dismissAnnouncement = (id: string) => {
    const updated = [...dismissedAnnouncements, id];
    setDismissedAnnouncements(updated);
    localStorage.setItem('dismissed_announcements', JSON.stringify(updated));
  };

  const visibleAnnouncements = announcements.filter(
    a => a.isPublished && !dismissedAnnouncements.includes(a.id)
  );

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
        <title>MegaShop - Ofertas Incríveis em Tudo | Até 90% DESCONTO</title>
        <meta name="description" content="Compra milhões de produtos a preços imbatíveis. Envio grátis em compras acima de €35. Flash deals, eletrónica, moda e muito mais!" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header onSearch={setSearchQuery} />

        <main className="container py-6">
          {/* Announcements */}
          {visibleAnnouncements.map(announcement => (
            <div key={announcement.id} className="mb-4 bg-gradient-to-r from-primary/10 to-amber-500/10 border border-primary/20 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
              <Megaphone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{announcement.title}</h3>
                <p className="text-sm text-muted-foreground">{announcement.body}</p>
              </div>
              <button onClick={() => dismissAnnouncement(announcement.id)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { icon: Truck, title: 'Envio Grátis', desc: 'Compras +€35' },
              { icon: Shield, title: 'Pagamento Seguro', desc: '100% Protegido' },
              { icon: Gift, title: 'Ofertas Diárias', desc: 'Até 90% DESC' },
              { icon: HeadphonesIcon, title: 'Suporte 24/7', desc: 'Sempre aqui' },
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
                  Produtos em Destaque
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
                {searchQuery ? `Resultados para "${searchQuery}"` : 'Todos os Produtos'}
              </h2>
              <span className="text-sm text-muted-foreground">
                {filteredProducts.length} produtos
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">Nenhum produto encontrado</p>
                <p className="text-sm text-muted-foreground mt-2">Tenta outra pesquisa</p>
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
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">M</span>
                </div>
                <span className="font-display font-bold text-foreground">
                  Mega<span className="text-primary">Shop</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                © 2024 MegaShop. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </footer>

        {/* Chat Widget */}
        <ChatWidget customerName={currentUser?.name} customerEmail={currentUser?.email} />
        
        {/* Cookie Consent */}
        <CookieConsent />
      </div>
    </>
  );
};

export default Index;
