import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/contexts/StoreContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateCartQuantity, clearCart, getCartTotal, addOrder } = useStore();
  const { toast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout'>('cart');
  
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    address: '',
  });

  const total = getCartTotal();
  const shipping = total > 35 ? 0 : 4.99;
  const grandTotal = total + shipping;

  const handleQuantityChange = (productId: string, delta: number) => {
    const item = cart.find(i => i.product.id === productId);
    if (!item) return;

    const newQty = item.quantity + delta;
    const result = updateCartQuantity(productId, newQty);

    if (!result.success) {
      setErrors(prev => ({ ...prev, [productId]: result.message }));
      setTimeout(() => {
        setErrors(prev => {
          const copy = { ...prev };
          delete copy[productId];
          return copy;
        });
      }, 3000);
    } else {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      });
    }
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerInfo.name || !customerInfo.email || !customerInfo.address) {
      toast({
        title: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingOut(true);

    // Simulate payment processing
    setTimeout(() => {
      addOrder({
        items: cart,
        total: grandTotal,
        status: 'paid',
        customerEmail: customerInfo.email,
        customerName: customerInfo.name,
        address: customerInfo.address,
      });

      clearCart();
      setIsCheckingOut(false);
      
      toast({
        title: "Order placed successfully!",
        description: "Thank you for your purchase!",
      });

      setCheckoutStep('cart');
      setCustomerInfo({ name: '', email: '', address: '' });
    }, 2000);
  };

  const handleCancelCheckout = () => {
    setCheckoutStep('cart');
  };

  if (cart.length === 0 && checkoutStep === 'cart') {
    return (
      <>
        <Helmet>
          <title>Cart | MegaShop</title>
        </Helmet>

        <div className="min-h-screen bg-background">
          <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
            <div className="container flex items-center h-14">
              <Link to="/" className="flex items-center gap-2 text-foreground">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Continue Shopping</span>
              </Link>
            </div>
          </header>

          <div className="container py-16 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">Start shopping to add items to your cart!</p>
            <Link to="/">
              <Button variant="deal" size="lg">Start Shopping</Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Cart | MegaShop</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
          <div className="container flex items-center justify-between h-14">
            <Link to="/" className="flex items-center gap-2 text-foreground">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Continue Shopping</span>
            </Link>
            <h1 className="font-display font-bold text-foreground">
              {checkoutStep === 'cart' ? 'Shopping Cart' : 'Checkout'}
            </h1>
          </div>
        </header>

        <main className="container py-6">
          {checkoutStep === 'cart' ? (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.map(item => (
                  <div key={item.product.id} className={cn(
                    "bg-card rounded-xl p-4 shadow-sm flex gap-4 transition-all",
                    errors[item.product.id] && "ring-2 ring-destructive animate-shake"
                  )}>
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground line-clamp-2">{item.product.name}</h3>
                      <p className="text-lg font-bold text-primary mt-1">
                        ${item.product.price.toFixed(2)}
                      </p>
                      
                      {errors[item.product.id] && (
                        <p className="text-sm text-destructive font-medium mt-1 animate-fade-in">
                          {errors[item.product.id]}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-border rounded-lg overflow-hidden">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.product.id, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.product.id, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-xl p-6 shadow-sm sticky top-20">
                  <h2 className="font-display font-bold text-foreground mb-4">Order Summary</h2>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium text-foreground">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className={cn("font-medium", shipping === 0 ? "text-success" : "text-foreground")}>
                        {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    {shipping > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Add ${(35 - total).toFixed(2)} more for free shipping!
                      </p>
                    )}
                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between">
                        <span className="font-semibold text-foreground">Total</span>
                        <span className="font-bold text-lg text-primary">${grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="deal"
                    size="lg"
                    className="w-full mt-6"
                    onClick={() => setCheckoutStep('checkout')}
                  >
                    <CreditCard className="w-5 h-5" />
                    Proceed to Checkout
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <div className="max-w-lg mx-auto">
              <div className="bg-card rounded-xl p-6 shadow-sm">
                <h2 className="font-display font-bold text-foreground mb-6">Shipping Information</h2>
                
                <form onSubmit={handleCheckout} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Shipping Address</label>
                    <textarea
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground min-h-[80px]"
                      placeholder="123 Main St, City, Country"
                      required
                    />
                  </div>

                  <div className="border-t border-border pt-4 mt-6">
                    <div className="flex justify-between mb-4">
                      <span className="font-semibold text-foreground">Total</span>
                      <span className="font-bold text-lg text-primary">${grandTotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={handleCancelCheckout}
                        disabled={isCheckingOut}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="deal"
                        className="flex-1"
                        disabled={isCheckingOut}
                      >
                        {isCheckingOut ? (
                          <span className="animate-pulse">Processing...</span>
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5" />
                            Pay Now
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Cart;
