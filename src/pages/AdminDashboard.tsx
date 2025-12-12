import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  LogOut, 
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  DollarSign,
  Users,
  TrendingUp,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore, Product } from '@/contexts/StoreContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type Tab = 'overview' | 'products' | 'orders' | 'reviews';

const AdminDashboard: React.FC = () => {
  const { 
    products, 
    orders, 
    reviews, 
    isAdminLoggedIn, 
    adminLogout, 
    addProduct, 
    updateProduct, 
    deleteProduct,
    approveReview,
    deleteReview,
    updateOrderStatus
  } = useStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    originalPrice: '',
    image: '',
    category: 'Electronics',
    stock: '',
    description: '',
    isFeatured: false,
    isFlashDeal: false,
  });

  if (!isAdminLoggedIn) {
    return <Navigate to="/admin-login" replace />;
  }

  const handleLogout = () => {
    adminLogout();
    navigate('/');
  };

  const totalRevenue = orders.filter(o => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered')
    .reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const pendingReviews = reviews.filter(r => !r.isApproved).length;
  const lowStockProducts = products.filter(p => p.stock <= 5).length;

  const handleSaveProduct = () => {
    const productData = {
      name: productForm.name,
      price: parseFloat(productForm.price) || 0,
      originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : undefined,
      image: productForm.image || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400',
      category: productForm.category,
      stock: parseInt(productForm.stock) || 0,
      description: productForm.description,
      rating: 4.5,
      reviewCount: 0,
      isFeatured: productForm.isFeatured,
      isFlashDeal: productForm.isFlashDeal,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      toast({ title: 'Product updated!' });
    } else {
      addProduct(productData);
      toast({ title: 'Product added!' });
    }

    setEditingProduct(null);
    setIsAddingProduct(false);
    setProductForm({
      name: '', price: '', originalPrice: '', image: '', category: 'Electronics',
      stock: '', description: '', isFeatured: false, isFlashDeal: false
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      image: product.image,
      category: product.category,
      stock: product.stock.toString(),
      description: product.description,
      isFeatured: product.isFeatured || false,
      isFlashDeal: product.isFlashDeal || false,
    });
    setIsAddingProduct(true);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
  ];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | MegaShop</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r border-border p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-deal rounded-xl flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">M</span>
            </div>
            <div>
              <span className="font-display font-bold text-foreground">Admin</span>
              <p className="text-xs text-muted-foreground">Dashboard</p>
            </div>
          </div>

          <nav className="space-y-1 flex-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>

          <Button variant="ghost" className="mt-auto" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <h1 className="text-3xl font-display font-bold text-foreground">Dashboard Overview</h1>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-success' },
                  { label: 'Total Orders', value: totalOrders, icon: ShoppingCart, color: 'text-primary' },
                  { label: 'Pending Reviews', value: pendingReviews, icon: MessageSquare, color: 'text-warning' },
                  { label: 'Low Stock Items', value: lowStockProducts, icon: TrendingUp, color: 'text-destructive' },
                ].map(stat => (
                  <div key={stat.label} className="bg-card rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground text-sm">{stat.label}</span>
                      <stat.icon className={cn("w-5 h-5", stat.color)} />
                    </div>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm">
                <h2 className="font-display font-bold text-foreground mb-4">Recent Orders</h2>
                <div className="space-y-3">
                  {orders.slice(0, 5).map(order => (
                    <div key={order.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div>
                        <p className="font-medium text-foreground">{order.customerName}</p>
                        <p className="text-sm text-muted-foreground">{new Date(order.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">${order.total.toFixed(2)}</p>
                        <span className={cn(
                          "text-xs font-medium px-2 py-1 rounded-full",
                          order.status === 'paid' && "bg-success/10 text-success",
                          order.status === 'pending' && "bg-warning/10 text-warning",
                          order.status === 'shipped' && "bg-primary/10 text-primary",
                          order.status === 'delivered' && "bg-success/10 text-success",
                          order.status === 'cancelled' && "bg-destructive/10 text-destructive",
                        )}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No orders yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-display font-bold text-foreground">Products</h1>
                <Button onClick={() => { setIsAddingProduct(true); setEditingProduct(null); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>

              {/* Product Form Modal */}
              {isAddingProduct && (
                <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                  <h2 className="font-display font-bold text-foreground mb-4">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <Input
                        value={productForm.name}
                        onChange={(e) => setProductForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="Product name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm(p => ({ ...p, category: e.target.value }))}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background"
                      >
                        <option>Electronics</option>
                        <option>Fashion</option>
                        <option>Home</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Price</label>
                      <Input
                        type="number"
                        value={productForm.price}
                        onChange={(e) => setProductForm(p => ({ ...p, price: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Original Price (optional)</label>
                      <Input
                        type="number"
                        value={productForm.originalPrice}
                        onChange={(e) => setProductForm(p => ({ ...p, originalPrice: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Stock</label>
                      <Input
                        type="number"
                        value={productForm.stock}
                        onChange={(e) => setProductForm(p => ({ ...p, stock: e.target.value }))}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Image URL</label>
                      <Input
                        value={productForm.image}
                        onChange={(e) => setProductForm(p => ({ ...p, image: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        value={productForm.description}
                        onChange={(e) => setProductForm(p => ({ ...p, description: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background min-h-[80px]"
                        placeholder="Product description..."
                      />
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={productForm.isFeatured}
                          onChange={(e) => setProductForm(p => ({ ...p, isFeatured: e.target.checked }))}
                        />
                        Featured
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={productForm.isFlashDeal}
                          onChange={(e) => setProductForm(p => ({ ...p, isFlashDeal: e.target.checked }))}
                        />
                        Flash Deal
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button onClick={handleSaveProduct}>Save Product</Button>
                    <Button variant="outline" onClick={() => setIsAddingProduct(false)}>Cancel</Button>
                  </div>
                </div>
              )}

              {/* Products Table */}
              <div className="bg-card rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Stock</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id} className="border-t border-border">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={product.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                            <span className="font-medium text-foreground">{product.name}</span>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-foreground">${product.price.toFixed(2)}</td>
                        <td className="p-4">
                          <span className={cn(
                            "font-medium",
                            product.stock <= 5 ? "text-destructive" : "text-foreground"
                          )}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">{product.category}</td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => {
                            deleteProduct(product.id);
                            toast({ title: 'Product deleted' });
                          }}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-display font-bold text-foreground">Orders</h1>
              
              <div className="bg-card rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">Order ID</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Customer</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Total</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id} className="border-t border-border">
                        <td className="p-4 font-mono text-sm text-foreground">#{order.id.slice(-6)}</td>
                        <td className="p-4">
                          <p className="font-medium text-foreground">{order.customerName}</p>
                          <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                        </td>
                        <td className="p-4 font-bold text-foreground">${order.total.toFixed(2)}</td>
                        <td className="p-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                            className="text-sm px-3 py-1 rounded-lg border border-border bg-background"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-4 text-right text-sm text-muted-foreground">
                          {new Date(order.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          No orders yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-display font-bold text-foreground">Reviews</h1>
              
              <div className="space-y-4">
                {reviews.map(review => {
                  const product = products.find(p => p.id === review.productId);
                  return (
                    <div key={review.id} className={cn(
                      "bg-card rounded-xl p-4 shadow-sm",
                      !review.isApproved && "border-2 border-warning"
                    )}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-foreground">{review.userName}</span>
                            {!review.isApproved && (
                              <span className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded-full">
                                Pending
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            on <strong>{product?.name || 'Unknown Product'}</strong>
                          </p>
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
                          <p className="text-foreground">{review.comment}</p>
                        </div>
                        <div className="flex gap-2">
                          {!review.isApproved && (
                            <Button
                              variant="success"
                              size="icon"
                              onClick={() => {
                                approveReview(review.id);
                                toast({ title: 'Review approved' });
                              }}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              deleteReview(review.id);
                              toast({ title: 'Review deleted' });
                            }}
                          >
                            <X className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {reviews.length === 0 && (
                  <div className="bg-card rounded-xl p-8 text-center text-muted-foreground">
                    No reviews yet
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;
