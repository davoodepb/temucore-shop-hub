import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Star, ShoppingCart, Plus, Minus, Share2, Check, Zap, Truck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/contexts/StoreContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products, reviews, addToCart, addReview } = useStore();
  const { toast } = useToast();
  
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewName, setReviewName] = useState('');

  const product = products.find(p => p.id === id);
  const productReviews = reviews.filter(r => r.productId === id && r.isApproved);

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Product not found</h1>
          <Link to="/">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleQuantityChange = (delta: number) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= product.stock) {
      setQuantity(newQty);
      setError(null);
    } else if (newQty > product.stock) {
      setError(`Only ${product.stock} available!`);
    }
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    setError(null);

    const result = addToCart(product, quantity);
    
    setTimeout(() => {
      setIsAdding(false);
      if (result.success) {
        setIsAdded(true);
        toast({
          title: "Added to cart!",
          description: `${quantity}x ${product.name}`,
        });
        setTimeout(() => setIsAdded(false), 2000);
      } else {
        setError(result.message);
      }
    }, 300);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product.name,
        text: `Check out this deal: ${product.name} for $${product.price}!`,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Share this product with your friends",
      });
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      toast({
        title: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    addReview({
      productId: product.id,
      userName: reviewName.trim(),
      rating: reviewRating,
      comment: reviewComment.trim(),
    });

    toast({
      title: "Review submitted!",
      description: "Your review is pending approval",
    });

    setReviewName('');
    setReviewComment('');
    setReviewRating(5);
  };

  return (
    <>
      <Helmet>
        <title>{product.name} | MegaShop</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
          <div className="container flex items-center justify-between h-14">
            <Link to="/" className="flex items-center gap-2 text-foreground">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </header>

        <main className="container py-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image */}
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isFlashDeal && (
                  <span className="inline-flex items-center gap-1 bg-gradient-deal text-primary-foreground text-sm font-bold px-3 py-1.5 rounded-full">
                    <Zap className="w-4 h-4" />
                    FLASH DEAL
                  </span>
                )}
                {discount > 0 && (
                  <span className="bg-deal text-deal-foreground text-sm font-bold px-3 py-1.5 rounded-full">
                    -{discount}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Title & Rating */}
              <div>
                <span className="text-sm text-primary font-medium">{product.category}</span>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mt-1">
                  {product.name}
                </h1>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-4 h-4",
                          i < Math.floor(product.rating)
                            ? "fill-accent text-accent"
                            : "text-muted"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-foreground">{product.rating}</span>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviewCount.toLocaleString()} reviews)
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-primary">${product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Stock */}
              <div>
                {product.stock > 0 ? (
                  <span className={cn(
                    "text-sm font-medium",
                    product.stock <= 5 ? "text-warning" : "text-success"
                  )}>
                    {product.stock <= 5 ? `Only ${product.stock} left!` : `${product.stock} in stock`}
                  </span>
                ) : (
                  <span className="text-sm font-medium text-destructive">Out of stock</span>
                )}
              </div>

              {/* Description */}
              <p className="text-muted-foreground">{product.description}</p>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="w-4 h-4 text-success" />
                  Free shipping
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-success" />
                  Buyer protection
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-destructive font-medium animate-fade-in bg-destructive/10 px-4 py-2 rounded-lg">
                  {error}
                </p>
              )}

              {/* Quantity & Add to Cart */}
              {product.stock > 0 && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <Button
                    variant={isAdded ? "success" : "deal"}
                    size="lg"
                    className="flex-1"
                    onClick={handleAddToCart}
                    disabled={isAdding}
                  >
                    {isAdding ? (
                      <span className="animate-pulse">Adding...</span>
                    ) : isAdded ? (
                      <>
                        <Check className="w-5 h-5" />
                        Added to Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <section className="mt-12">
            <h2 className="text-2xl font-display font-bold text-foreground mb-6">
              Customer Reviews
            </h2>

            {/* Review Form */}
            <div className="bg-card rounded-xl p-6 mb-8 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4">Write a Review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Your Name</label>
                  <input
                    type="text"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                    placeholder="Enter your name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                      >
                        <Star
                          className={cn(
                            "w-6 h-6 transition-colors",
                            star <= reviewRating
                              ? "fill-accent text-accent"
                              : "text-muted hover:text-accent"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Comment</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground min-h-[100px]"
                    placeholder="Share your experience with this product..."
                  />
                </div>

                <Button type="submit">Submit Review</Button>
              </form>
            </div>

            {/* Reviews List */}
            {productReviews.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No reviews yet. Be the first to review this product!
              </p>
            ) : (
              <div className="space-y-4">
                {productReviews.map(review => (
                  <div key={review.id} className="bg-card rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{review.userName}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-4 h-4",
                            i < review.rating ? "fill-accent text-accent" : "text-muted"
                          )}
                        />
                      ))}
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
