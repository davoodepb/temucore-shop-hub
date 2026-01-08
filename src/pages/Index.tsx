import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/layout/Header';
import { ProductCard } from '@/components/products/ProductCard';
import { FlashDeals } from '@/components/products/FlashDeals';
import { ProductsCarousel } from '@/components/products/ProductsCarousel';
import { CookieConsent } from '@/components/common/CookieConsent';
import { useStore } from '@/contexts/StoreContext';
import { Megaphone, X, Mail, Phone, Newspaper, Info } from 'lucide-react';

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

  // About Us
  const [aboutUs, setAboutUs] = useState<{
    description: string;
    email: string;
    phone: string;
    whatsapp: string;
    instagram: string;
    facebook: string;
    image: string;
  } | null>(null);

  // News
  const [news, setNews] = useState<Array<{ id: string; title: string; content: string; image: string; date: string }>>([]);

  useEffect(() => {
    // Load announcements
    const savedAnnouncements = localStorage.getItem('announcements');
    if (savedAnnouncements) {
      setAnnouncements(JSON.parse(savedAnnouncements));
    }

    const dismissed = localStorage.getItem('dismissed_announcements');
    if (dismissed) {
      setDismissedAnnouncements(JSON.parse(dismissed));
    }

    // Load about us
    const savedAbout = localStorage.getItem('site_about');
    if (savedAbout) {
      setAboutUs(JSON.parse(savedAbout));
    }

    // Load news
    const savedNews = localStorage.getItem('site_news');
    if (savedNews) {
      setNews(JSON.parse(savedNews));
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
        <title>FIO & ALMA STUDIO - Moda Artesanal com Alma</title>
        <meta name="description" content="Descubra peças únicas feitas à mão. Moda artesanal portuguesa com qualidade e estilo." />
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


          {/* Flash Deals Section */}
          {!searchQuery && <FlashDeals />}

          {/* Featured Products with Carousel */}
          {!searchQuery && featuredProducts.length > 0 && (
            <ProductsCarousel products={featuredProducts} title="Produtos em Destaque" />
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

          {/* News Section */}
          {news.length > 0 && (
            <section className="py-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Newspaper className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-display font-bold text-foreground">Novidades</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {news.slice(0, 3).map(item => (
                  <div key={item.id} className="bg-card rounded-xl overflow-hidden shadow-sm border border-border">
                    {item.image && (
                      <div className="aspect-[16/10] w-full overflow-hidden bg-muted">
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{item.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(item.date).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* About Us Section */}
          {aboutUs && (aboutUs.description || aboutUs.email || aboutUs.phone) && (
            <section className="py-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Info className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-display font-bold text-foreground">Sobre Nós</h2>
              </div>
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <div className="flex flex-col md:flex-row gap-6">
                  {aboutUs.image && (
                    <div className="w-full md:w-64 aspect-[4/3] overflow-hidden rounded-lg shrink-0 bg-muted">
                      <img src={aboutUs.image} alt="Sobre nós" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 space-y-4">
                    {aboutUs.description && (
                      <p className="text-muted-foreground">{aboutUs.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4">
                      {aboutUs.email && (
                        <a href={`mailto:${aboutUs.email}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                          <Mail className="w-4 h-4" /> {aboutUs.email}
                        </a>
                      )}
                      {aboutUs.phone && (
                        <a href={`tel:${aboutUs.phone}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                          <Phone className="w-4 h-4" /> {aboutUs.phone}
                        </a>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {aboutUs.whatsapp && (
                        <a href={aboutUs.whatsapp} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors">
                          WhatsApp
                        </a>
                      )}
                      {aboutUs.instagram && (
                        <a href={aboutUs.instagram} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-lg hover:opacity-90 transition-opacity">
                          Instagram
                        </a>
                      )}
                      {aboutUs.facebook && (
                        <a href={aboutUs.facebook} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                          Facebook
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-card border-t border-border mt-12">
          <div className="container py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-600 to-amber-800 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">F</span>
                </div>
                <span className="font-display font-bold text-foreground">
                  FIO & ALMA<span className="text-primary"> STUDIO</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                © 2024 FIO & ALMA STUDIO. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </footer>

        {/* Cookie Consent */}
        <CookieConsent />
      </div>
    </>
  );
};

export default Index;
