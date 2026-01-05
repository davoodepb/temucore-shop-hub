import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, 
  Star, 
  ShoppingCart, 
  Check, 
  Share2, 
  Copy, 
  MessageCircle,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/contexts/StoreContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, reviews, addToCart, addReview } = useStore();
  const { toast } = useToast();
  
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      setCurrentUser(JSON.parse(saved));
    }
  }, []);

  const product = products.find(p => p.id === id);
  const productReviews = reviews.filter(r => r.productId === id && r.isApproved);
  const productUrl = window.location.href;

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Produto não encontrado</h1>
          <Button onClick={() => navigate('/')}>Voltar à loja</Button>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    setIsAdding(true);
    setError(null);

    const result = addToCart(product, quantity);
    
    setTimeout(() => {
      setIsAdding(false);
      if (result.success) {
        setIsAdded(true);
        toast({
          title: "Adicionado ao cesto!",
          description: `${quantity}x ${product.name}`,
        });
        setTimeout(() => setIsAdded(false), 2000);
      } else {
        setError(result.message);
        setTimeout(() => setError(null), 3000);
      }
    }, 300);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setLinkCopied(true);
      toast({ title: 'Link copiado!' });
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast({ title: 'Erro ao copiar link', variant: 'destructive' });
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Vê este produto incrível: ${product.name} - €${product.price.toFixed(2)}\n${productUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setShowShareMenu(false);
  };

  const handleShareInstagram = () => {
    handleCopyLink();
    toast({ 
      title: 'Link copiado!', 
      description: 'Cola o link no Instagram para partilhar.' 
    });
    setShowShareMenu(false);
  };

  const handleSubmitReview = () => {
    if (!currentUser) {
      toast({ title: 'Faz login para comentar', variant: 'destructive' });
      navigate('/auth');
      return;
    }

    if (!reviewComment.trim()) {
      toast({ title: 'Escreve um comentário', variant: 'destructive' });
      return;
    }

    addReview({
      productId: product.id,
      userName: currentUser.name,
      rating: reviewRating,
      comment: reviewComment.trim(),
    });

    toast({ title: 'Comentário enviado!', description: 'Será aprovado em breve.' });
    setReviewComment('');
    setReviewRating(5);
    setShowReviewForm(false);
  };

  const maxQuantity = product.stock === 1 ? 1 : product.stock;

  return (
    <>
      <Helmet>
        <title>{product.name} | FIO & ALMA STUDIO</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="container flex items-center justify-between py-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="relative">
              <Button variant="outline" size="sm" onClick={() => setShowShareMenu(!showShareMenu)}>
                <Share2 className="w-4 h-4 mr-2" />
                Partilhar
              </Button>
              
              {showShareMenu && (
                <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-lg p-2 min-w-[180px] z-50 animate-fade-in">
                  <button
                    onClick={handleShareWhatsApp}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm text-foreground"
                  >
                    <span className="text-green-500"><WhatsAppIcon /></span>
                    WhatsApp
                  </button>
                  <button
                    onClick={handleShareInstagram}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm text-foreground"
                  >
                    <span className="text-pink-500"><InstagramIcon /></span>
                    Instagram
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm text-foreground"
                  >
                    {linkCopied ? (
                      <>
                        <Check className="w-5 h-5 text-success" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5 text-muted-foreground" />
                        Copiar link
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="container py-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative aspect-auto max-h-[600px] overflow-hidden rounded-2xl bg-muted">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain"
              />
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-deal text-deal-foreground text-sm font-bold px-3 py-1 rounded-full">
                  -{discount}%
                </span>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{product.category}</p>
                <h1 className="text-3xl font-display font-bold text-foreground">{product.name}</h1>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-5 h-5",
                        i < Math.floor(product.rating)
                          ? "fill-accent text-accent"
                          : "text-muted"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({productReviews.length} comentários)
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-primary">€{product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    €{product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              <div>
                {product.stock === 0 ? (
                  <span className="inline-flex items-center text-destructive font-medium">
                    ❌ Esgotado
                  </span>
                ) : product.stock <= 5 ? (
                  <span className="inline-flex items-center text-warning font-medium">
                    ⚠️ Apenas {product.stock} em stock!
                  </span>
                ) : (
                  <span className="inline-flex items-center text-success font-medium">
                    ✓ Em stock ({product.stock} disponíveis)
                  </span>
                )}
              </div>

              <p className="text-muted-foreground leading-relaxed">{product.description}</p>

              {product.stock > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium">Quantidade:</label>
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                      <button
                        className="px-3 py-2 hover:bg-muted transition-colors"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        -
                      </button>
                      <span className="px-4 py-2 bg-muted font-medium">{quantity}</span>
                      <button
                        className="px-3 py-2 hover:bg-muted transition-colors"
                        onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm text-muted-foreground">Máx: {maxQuantity}</span>
                  </div>

                  {error && (
                    <p className="text-destructive font-medium animate-fade-in">{error}</p>
                  )}

                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    variant={isAdded ? "success" : "default"}
                  >
                    {isAdding ? (
                      <span className="animate-pulse">A adicionar...</span>
                    ) : isAdded ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Adicionado!
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Adicionar ao Cesto
                      </>
                    )}
                  </Button>
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium mb-3">Partilhar este produto:</p>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" onClick={handleShareWhatsApp}>
                    <span className="text-green-500 mr-2"><WhatsAppIcon /></span>
                    WhatsApp
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShareInstagram}>
                    <span className="text-pink-500 mr-2"><InstagramIcon /></span>
                    Instagram
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCopyLink}>
                    {linkCopied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <section className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-foreground">
                Comentários ({productReviews.length})
              </h2>
              <Button variant="outline" onClick={() => setShowReviewForm(!showReviewForm)}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Escrever comentário
              </Button>
            </div>

            {showReviewForm && (
              <div className="bg-card rounded-xl p-6 border border-border mb-6 animate-fade-in">
                {!currentUser ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-3">Faz login para deixar um comentário</p>
                    <Button onClick={() => navigate('/auth')}>Fazer Login</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Avaliação</label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setReviewRating(star)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={cn(
                                "w-8 h-8 transition-colors",
                                star <= reviewRating
                                  ? "fill-accent text-accent"
                                  : "text-muted hover:text-accent/50"
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Comentário</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background min-h-[100px] resize-none"
                        placeholder="Escreve a tua opinião sobre este produto..."
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handleSubmitReview}>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar
                      </Button>
                      <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {productReviews.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Ainda não há comentários.</p>
                <p className="text-sm">Sê o primeiro a avaliar este produto!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {productReviews.map((review) => (
                  <div key={review.id} className="bg-card rounded-xl p-5 border border-border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-foreground">{review.userName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.date).toLocaleDateString('pt-PT')}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-4 h-4",
                              i < review.rating
                                ? "fill-accent text-accent"
                                : "text-muted"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
};

export default ProductDetail;
