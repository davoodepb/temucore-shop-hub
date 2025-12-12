import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  adminLogin: (password: string) => boolean;
  adminLogout: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const ADMIN_PASSWORD = 'admin123';

const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Bluetooth Earbuds Pro',
    price: 29.99,
    originalPrice: 79.99,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
    category: 'Electronics',
    stock: 150,
    rating: 4.8,
    reviewCount: 2340,
    description: 'Premium wireless earbuds with noise cancellation and 30h battery life.',
    isFeatured: true,
    isFlashDeal: true,
  },
  {
    id: '2',
    name: 'Smart Watch Fitness Tracker',
    price: 45.99,
    originalPrice: 129.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    category: 'Electronics',
    stock: 89,
    rating: 4.6,
    reviewCount: 1567,
    description: 'Track your fitness goals with heart rate monitoring and GPS.',
    isFeatured: true,
  },
  {
    id: '3',
    name: 'Cozy Oversized Hoodie',
    price: 24.99,
    originalPrice: 59.99,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
    category: 'Fashion',
    stock: 1,
    rating: 4.9,
    reviewCount: 892,
    description: 'Ultra-soft premium cotton blend hoodie for maximum comfort.',
    isFlashDeal: true,
  },
  {
    id: '4',
    name: 'LED Desk Lamp with USB',
    price: 18.99,
    originalPrice: 45.99,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
    category: 'Home',
    stock: 234,
    rating: 4.7,
    reviewCount: 445,
    description: 'Adjustable brightness LED lamp with USB charging port.',
  },
  {
    id: '5',
    name: 'Portable Phone Charger 20000mAh',
    price: 22.99,
    originalPrice: 49.99,
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400',
    category: 'Electronics',
    stock: 567,
    rating: 4.5,
    reviewCount: 3201,
    description: 'Fast charging power bank with dual USB ports.',
    isFeatured: true,
  },
  {
    id: '6',
    name: 'Minimalist Crossbody Bag',
    price: 19.99,
    originalPrice: 39.99,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
    category: 'Fashion',
    stock: 78,
    rating: 4.4,
    reviewCount: 234,
    description: 'Stylish vegan leather crossbody bag with adjustable strap.',
  },
  {
    id: '7',
    name: 'Aromatherapy Essential Oil Diffuser',
    price: 15.99,
    originalPrice: 34.99,
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400',
    category: 'Home',
    stock: 189,
    rating: 4.6,
    reviewCount: 678,
    description: 'Ultrasonic diffuser with LED mood lighting.',
  },
  {
    id: '8',
    name: 'Vintage Sunglasses Retro Style',
    price: 12.99,
    originalPrice: 29.99,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',
    category: 'Fashion',
    stock: 456,
    rating: 4.3,
    reviewCount: 123,
    description: 'UV400 protection with classic vintage design.',
    isFlashDeal: true,
  },
];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('admin_logged_in');
    return saved === 'true';
  });

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

  useEffect(() => {
    localStorage.setItem('admin_logged_in', String(isAdminLoggedIn));
  }, [isAdminLoggedIn]);

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

  const adminLogin = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAdminLoggedIn(true);
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminLoggedIn(false);
  };

  return (
    <StoreContext.Provider value={{
      products,
      cart,
      reviews,
      orders,
      isAdminLoggedIn,
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
