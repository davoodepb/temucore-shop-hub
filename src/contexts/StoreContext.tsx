import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  stock: number;
  rating: number;
  reviewCount: number;
  description: string;
  isFeatured?: boolean;
  isFlashDeal?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  isApproved: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  customerEmail: string;
  customerName: string;
  address: string;
  date: string;
}

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  reviews: Review[];
  orders: Order[];
  isAdminLoggedIn: boolean;
  isLoading: boolean;
  user: User | null;
  addToCart: (product: Product, quantity?: number) => { success: boolean; message: string };
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => { success: boolean; message: string };
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addReview: (review: Omit<Review, 'id' | 'date' | 'isApproved'>) => void;
  approveReview: (id: string) => void;
  deleteReview: (id: string) => void;
  addOrder: (order: Omit<Order, 'id' | 'date'>) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  adminLogout: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Produtos vazios - apenas o admin pode adicionar produtos
const initialProducts: Product[] = [];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('store_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('store_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('store_reviews');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('store_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Check admin role
  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }
      return !!data;
    } catch {
      return false;
    }
  };

  // Auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            checkAdminRole(session.user.id).then(isAdmin => {
              setIsAdminLoggedIn(isAdmin);
              setIsLoading(false);
            });
          }, 0);
        } else {
          setIsAdminLoggedIn(false);
          setIsLoading(false);
        }
      }
    );

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkAdminRole(session.user.id).then(isAdmin => {
          setIsAdminLoggedIn(isAdmin);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('store_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('store_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('store_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('store_orders', JSON.stringify(orders));
  }, [orders]);


  const addToCart = (product: Product, quantity: number = 1): { success: boolean; message: string } => {
    const existingItem = cart.find(item => item.product.id === product.id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const totalQuantity = currentQuantity + quantity;

    if (product.stock === 0) {
      return { success: false, message: 'Out of stock!' };
    }

    if (totalQuantity > product.stock) {
      return { success: false, message: `Only ${product.stock} available!` };
    }

    if (product.stock === 1 && totalQuantity > 1) {
      return { success: false, message: 'Only 1 item available!' };
    }

    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: totalQuantity }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity }]);
    }

    return { success: true, message: 'Added to cart!' };
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number): { success: boolean; message: string } => {
    const item = cart.find(i => i.product.id === productId);
    if (!item) return { success: false, message: 'Item not found' };

    if (quantity > item.product.stock) {
      return { success: false, message: `Only ${item.product.stock} available!` };
    }

    if (quantity < 1) {
      removeFromCart(productId);
      return { success: true, message: 'Item removed' };
    }

    setCart(cart.map(i =>
      i.product.id === productId ? { ...i, quantity } : i
    ));
    return { success: true, message: 'Updated!' };
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const getCartItemCount = () => cart.reduce((sum, item) => sum + item.quantity, 0);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: Date.now().toString() };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const addReview = (review: Omit<Review, 'id' | 'date' | 'isApproved'>) => {
    const newReview: Review = {
      ...review,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      isApproved: false,
    };
    setReviews([...reviews, newReview]);
  };

  const approveReview = (id: string) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, isApproved: true } : r));
  };

  const deleteReview = (id: string) => {
    setReviews(reviews.filter(r => r.id !== id));
  };

  const addOrder = (order: Omit<Order, 'id' | 'date'>) => {
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    setOrders([...orders, newOrder]);
    
    // Update stock
    order.items.forEach(item => {
      updateProduct(item.product.id, {
        stock: item.product.stock - item.quantity
      });
    });
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
  };

  const adminLogin = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      if (data.user) {
        const isAdmin = await checkAdminRole(data.user.id);
        if (!isAdmin) {
          await supabase.auth.signOut();
          return { success: false, message: 'Não tens permissão de administrador.' };
        }
        setIsAdminLoggedIn(true);
        return { success: true, message: 'Login bem sucedido!' };
      }

      return { success: false, message: 'Erro ao fazer login.' };
    } catch {
      return { success: false, message: 'Erro de conexão.' };
    }
  };

  const adminLogout = async () => {
    await supabase.auth.signOut();
    setIsAdminLoggedIn(false);
    setUser(null);
    setSession(null);
  };

  return (
    <StoreContext.Provider value={{
      products,
      cart,
      reviews,
      orders,
      isAdminLoggedIn,
      isLoading,
      user,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      getCartTotal,
      getCartItemCount,
      addProduct,
      updateProduct,
      deleteProduct,
      addReview,
      approveReview,
      deleteReview,
      addOrder,
      updateOrderStatus,
      adminLogin,
      adminLogout,
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
