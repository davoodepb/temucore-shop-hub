import React, { useState, useEffect } from 'react';
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
  Star,
  Megaphone,
  MessageCircle,
  BarChart3,
  Settings,
  Download,
  DollarSign,
  TrendingUp,
  Info,
  Newspaper,
  Mail,
  Phone,
  Link as LinkIcon,
  Image
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore, Product } from '@/contexts/StoreContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts';

type Tab = 'overview' | 'analytics' | 'products' | 'orders' | 'reviews' | 'announcements' | 'chat' | 'about' | 'news' | 'settings';

interface Announcement {
  id: string;
  title: string;
  body: string;
  isPublished: boolean;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'customer' | 'admin';
  timestamp: Date;
}

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

  // Announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('announcements');
    return saved ? JSON.parse(saved) : [];
  });
  const [announcementForm, setAnnouncementForm] = useState({ title: '', body: '' });

  // Chat
  const [allChats, setAllChats] = useState<Record<string, { name: string; messages: ChatMessage[] }>>({});
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [adminReply, setAdminReply] = useState('');

  // About Us
  const [aboutUs, setAboutUs] = useState(() => {
    const saved = localStorage.getItem('site_about');
    return saved ? JSON.parse(saved) : {
      description: '',
      email: '',
      phone: '',
      whatsapp: '',
      instagram: '',
      facebook: '',
      image: ''
    };
  });

  // News
  const [news, setNews] = useState<Array<{ id: string; title: string; content: string; image: string; date: string }>>(() => {
    const saved = localStorage.getItem('site_news');
    return saved ? JSON.parse(saved) : [];
  });
  const [newsForm, setNewsForm] = useState({ title: '', content: '', image: '' });

  useEffect(() => {
    // Load all chats from localStorage
    const chats: Record<string, { name: string; messages: ChatMessage[] }> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('chat_')) {
        const email = key.replace('chat_', '');
        const messages = JSON.parse(localStorage.getItem(key) || '[]');
        // Get user name
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find((u: any) => u.email === email);
        chats[email] = { name: user?.name || email, messages };
      }
    }
    setAllChats(chats);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('site_about', JSON.stringify(aboutUs));
  }, [aboutUs]);

  useEffect(() => {
    localStorage.setItem('site_news', JSON.stringify(news));
  }, [news]);

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
      toast({ title: 'Produto atualizado!' });
    } else {
      addProduct(productData);
      toast({ title: 'Produto adicionado!' });
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

  const handleAddAnnouncement = () => {
    if (!announcementForm.title || !announcementForm.body) return;
    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      title: announcementForm.title,
      body: announcementForm.body,
      isPublished: true,
      createdAt: new Date().toISOString(),
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    setAnnouncementForm({ title: '', body: '' });
    toast({ title: 'Anúncio publicado!' });
  };

  const handleSendAdminReply = () => {
    if (!adminReply.trim() || !selectedChat) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: adminReply.trim(),
      sender: 'admin',
      timestamp: new Date(),
    };
    const updatedMessages = [...(allChats[selectedChat]?.messages || []), newMessage];
    localStorage.setItem(`chat_${selectedChat}`, JSON.stringify(updatedMessages));
    setAllChats(prev => ({
      ...prev,
      [selectedChat]: { ...prev[selectedChat], messages: updatedMessages }
    }));
    setAdminReply('');
    toast({ title: 'Resposta enviada!' });
  };

  const handleSaveAbout = () => {
    localStorage.setItem('site_about', JSON.stringify(aboutUs));
    toast({ title: 'Sobre Nós atualizado!' });
  };

  const handleAddNews = () => {
    if (!newsForm.title || !newsForm.content) return;
    const newNews = {
      id: Date.now().toString(),
      title: newsForm.title,
      content: newsForm.content,
      image: newsForm.image,
      date: new Date().toISOString()
    };
    setNews([newNews, ...news]);
    setNewsForm({ title: '', content: '', image: '' });
    toast({ title: 'Novidade adicionada!' });
  };

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'analytics', label: 'Análises', icon: BarChart3 },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
    { id: 'reviews', label: 'Avaliações', icon: MessageSquare },
    { id: 'announcements', label: 'Anúncios', icon: Megaphone },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'about', label: 'Sobre Nós', icon: Info },
    { id: 'news', label: 'Novidades', icon: Newspaper },
    { id: 'settings', label: 'Definições', icon: Settings },
  ];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | FIO & ALMA STUDIO</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r border-border p-4 flex flex-col shrink-0">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-600 to-amber-800 rounded-xl flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">F</span>
            </div>
            <div>
              <span className="font-display font-bold text-foreground">FIO & ALMA</span>
              <p className="text-xs text-muted-foreground">Admin</p>
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
            Sair
          </Button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <h1 className="text-3xl font-display font-bold text-foreground">Visão Geral</h1>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Receita Total', value: `€${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-success' },
                  { label: 'Total Pedidos', value: totalOrders, icon: ShoppingCart, color: 'text-primary' },
                  { label: 'Avaliações Pendentes', value: pendingReviews, icon: MessageSquare, color: 'text-warning' },
                  { label: 'Stock Baixo', value: lowStockProducts, icon: TrendingUp, color: 'text-destructive' },
                ].map(stat => (
                  <div key={stat.label} className="bg-card rounded-xl p-6 shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground text-sm">{stat.label}</span>
                      <stat.icon className={cn("w-5 h-5", stat.color)} />
                    </div>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <h2 className="font-display font-bold text-foreground mb-4">Pedidos Recentes</h2>
                <div className="space-y-3">
                  {orders.slice(0, 5).map(order => (
                    <div key={order.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div>
                        <p className="font-medium text-foreground">{order.customerName}</p>
                        <p className="text-sm text-muted-foreground">{new Date(order.date).toLocaleDateString('pt-PT')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">€{order.total.toFixed(2)}</p>
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
                    <p className="text-muted-foreground text-center py-4">Sem pedidos ainda</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-display font-bold text-foreground">Análises Detalhadas</h1>
                <Button variant="outline" onClick={() => toast({ title: 'Exportação em breve!' })}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
              
              <AnalyticsCharts orders={orders} products={products} reviews={reviews} />
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-display font-bold text-foreground">Produtos</h1>
                <Button onClick={() => { setIsAddingProduct(true); setEditingProduct(null); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Produto
                </Button>
              </div>

              {isAddingProduct && (
                <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                  <h2 className="font-display font-bold text-foreground mb-4">
                    {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nome</label>
                      <Input
                        value={productForm.name}
                        onChange={(e) => setProductForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="Nome do produto"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Categoria</label>
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
                      <label className="block text-sm font-medium mb-1">Preço (€)</label>
                      <Input
                        type="number"
                        value={productForm.price}
                        onChange={(e) => setProductForm(p => ({ ...p, price: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Preço Original (opcional)</label>
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
                      <label className="block text-sm font-medium mb-1">Imagem do Produto</label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setProductForm(p => ({ ...p, image: reader.result as string }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="cursor-pointer"
                      />
                      {productForm.image && (
                        <div className="mt-2">
                          <img src={productForm.image} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">Ou cola um URL:</p>
                      <Input
                        value={productForm.image.startsWith('data:') ? '' : productForm.image}
                        onChange={(e) => setProductForm(p => ({ ...p, image: e.target.value }))}
                        placeholder="https://..."
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Descrição</label>
                      <textarea
                        value={productForm.description}
                        onChange={(e) => setProductForm(p => ({ ...p, description: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background min-h-[80px]"
                        placeholder="Descrição do produto..."
                      />
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={productForm.isFeatured}
                          onChange={(e) => setProductForm(p => ({ ...p, isFeatured: e.target.checked }))}
                        />
                        Destaque
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
                    <Button onClick={handleSaveProduct}>Guardar</Button>
                    <Button variant="outline" onClick={() => setIsAddingProduct(false)}>Cancelar</Button>
                  </div>
                </div>
              )}

              <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">Produto</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Preço</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Stock</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Categoria</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Ações</th>
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
                        <td className="p-4 font-medium text-foreground">€{product.price.toFixed(2)}</td>
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
                            toast({ title: 'Produto eliminado' });
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
              <h1 className="text-3xl font-display font-bold text-foreground">Pedidos</h1>
              
              <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">ID</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Cliente</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Total</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Estado</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Data</th>
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
                        <td className="p-4 font-bold text-foreground">€{order.total.toFixed(2)}</td>
                        <td className="p-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                            className="text-sm px-3 py-1 rounded-lg border border-border bg-background"
                          >
                            <option value="pending">Pendente</option>
                            <option value="paid">Pago</option>
                            <option value="shipped">Enviado</option>
                            <option value="delivered">Entregue</option>
                            <option value="cancelled">Cancelado</option>
                          </select>
                        </td>
                        <td className="p-4 text-right text-sm text-muted-foreground">
                          {new Date(order.date).toLocaleDateString('pt-PT')}
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          Sem pedidos ainda
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
              <h1 className="text-3xl font-display font-bold text-foreground">Avaliações</h1>
              
              <div className="space-y-4">
                {reviews.map(review => {
                  const product = products.find(p => p.id === review.productId);
                  return (
                    <div key={review.id} className={cn(
                      "bg-card rounded-xl p-4 shadow-sm border",
                      !review.isApproved ? "border-warning" : "border-border"
                    )}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-foreground">{review.userName}</span>
                            {!review.isApproved && (
                              <span className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded-full">
                                Pendente
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            em <strong>{product?.name || 'Produto desconhecido'}</strong>
                          </p>
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "w-4 h-4",
                                  i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted"
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
                                toast({ title: 'Avaliação aprovada' });
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
                              toast({ title: 'Avaliação eliminada' });
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
                  <div className="bg-card rounded-xl p-8 text-center text-muted-foreground border border-border">
                    Sem avaliações ainda
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Announcements Tab */}
          {activeTab === 'announcements' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-display font-bold text-foreground">Anúncios</h1>
              
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <h2 className="font-semibold text-foreground mb-4">Novo Anúncio</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Título</label>
                    <Input
                      value={announcementForm.title}
                      onChange={(e) => setAnnouncementForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="Título do anúncio"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mensagem</label>
                    <textarea
                      value={announcementForm.body}
                      onChange={(e) => setAnnouncementForm(f => ({ ...f, body: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background min-h-[80px]"
                      placeholder="Escreve a mensagem do anúncio..."
                    />
                  </div>
                  <Button onClick={handleAddAnnouncement} disabled={!announcementForm.title || !announcementForm.body}>
                    <Megaphone className="w-4 h-4 mr-2" />
                    Publicar Anúncio
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {announcements.map(announcement => (
                  <div key={announcement.id} className="bg-card rounded-xl p-4 shadow-sm border border-border">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">{announcement.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{announcement.body}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(announcement.createdAt).toLocaleDateString('pt-PT')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setAnnouncements(announcements.filter(a => a.id !== announcement.id));
                          toast({ title: 'Anúncio eliminado' });
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                {announcements.length === 0 && (
                  <div className="bg-card rounded-xl p-8 text-center text-muted-foreground border border-border">
                    Sem anúncios ainda
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-display font-bold text-foreground">Centro de Mensagens</h1>
              
              <div className="grid md:grid-cols-3 gap-6">
                {/* Chat List */}
                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <h2 className="font-semibold text-foreground">Conversas</h2>
                  </div>
                  <div className="divide-y divide-border">
                    {Object.entries(allChats).map(([email, chat]) => (
                      <button
                        key={email}
                        onClick={() => setSelectedChat(email)}
                        className={cn(
                          "w-full p-4 text-left hover:bg-muted transition-colors",
                          selectedChat === email && "bg-muted"
                        )}
                      >
                        <p className="font-medium text-foreground">{chat.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {chat.messages.length} mensagens
                        </p>
                      </button>
                    ))}
                    {Object.keys(allChats).length === 0 && (
                      <p className="p-4 text-sm text-muted-foreground text-center">
                        Sem conversas
                      </p>
                    )}
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="md:col-span-2 bg-card rounded-xl shadow-sm border border-border flex flex-col h-[500px]">
                  {selectedChat ? (
                    <>
                      <div className="p-4 border-b border-border">
                        <h2 className="font-semibold text-foreground">{allChats[selectedChat]?.name}</h2>
                        <p className="text-sm text-muted-foreground">{selectedChat}</p>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {allChats[selectedChat]?.messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={cn(
                              "max-w-[80%] p-3 rounded-2xl text-sm",
                              msg.sender === 'admin'
                                ? "bg-primary text-primary-foreground ml-auto rounded-br-sm"
                                : "bg-muted rounded-bl-sm"
                            )}
                          >
                            {msg.text}
                          </div>
                        ))}
                      </div>
                      <div className="p-4 border-t border-border">
                        <div className="flex gap-2">
                          <Input
                            value={adminReply}
                            onChange={(e) => setAdminReply(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendAdminReply()}
                            placeholder="Escreve uma resposta..."
                          />
                          <Button onClick={handleSendAdminReply}>Enviar</Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                      Seleciona uma conversa
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* About Us Tab */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-display font-bold text-foreground">Sobre Nós</h1>
              
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border max-w-2xl">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Descrição da Loja</label>
                    <textarea
                      value={aboutUs.description}
                      onChange={(e) => setAboutUs((prev: typeof aboutUs) => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background min-h-[120px]"
                      placeholder="Escreve uma descrição sobre a tua loja..."
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-1">
                        <Mail className="w-4 h-4" /> Email
                      </label>
                      <Input
                        type="email"
                        value={aboutUs.email}
                        onChange={(e) => setAboutUs((prev: typeof aboutUs) => ({ ...prev, email: e.target.value }))}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-1">
                        <Phone className="w-4 h-4" /> Telefone
                      </label>
                      <Input
                        value={aboutUs.phone}
                        onChange={(e) => setAboutUs((prev: typeof aboutUs) => ({ ...prev, phone: e.target.value }))}
                        placeholder="+351 123 456 789"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-1">
                        <LinkIcon className="w-4 h-4" /> WhatsApp
                      </label>
                      <Input
                        value={aboutUs.whatsapp}
                        onChange={(e) => setAboutUs((prev: typeof aboutUs) => ({ ...prev, whatsapp: e.target.value }))}
                        placeholder="https://wa.me/351123456789"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-1">
                        <LinkIcon className="w-4 h-4" /> Instagram
                      </label>
                      <Input
                        value={aboutUs.instagram}
                        onChange={(e) => setAboutUs((prev: typeof aboutUs) => ({ ...prev, instagram: e.target.value }))}
                        placeholder="https://instagram.com/..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-1">
                      <LinkIcon className="w-4 h-4" /> Facebook
                    </label>
                    <Input
                      value={aboutUs.facebook}
                      onChange={(e) => setAboutUs((prev: typeof aboutUs) => ({ ...prev, facebook: e.target.value }))}
                      placeholder="https://facebook.com/..."
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-1">
                      <Image className="w-4 h-4" /> Imagem
                    </label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setAboutUs((prev: typeof aboutUs) => ({ ...prev, image: reader.result as string }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="cursor-pointer"
                    />
                    {aboutUs.image && (
                      <div className="mt-2">
                        <img src={aboutUs.image} alt="Sobre nós" className="w-full max-w-xs h-32 object-cover rounded-lg" />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">Ou cola um URL:</p>
                    <Input
                      value={aboutUs.image.startsWith('data:') ? '' : aboutUs.image}
                      onChange={(e) => setAboutUs((prev: typeof aboutUs) => ({ ...prev, image: e.target.value }))}
                      placeholder="https://..."
                      className="mt-1"
                    />
                  </div>

                  <Button onClick={handleSaveAbout}>
                    Guardar Sobre Nós
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* News Tab */}
          {activeTab === 'news' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-display font-bold text-foreground">Novidades</h1>
              
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border max-w-2xl">
                <h2 className="font-semibold text-foreground mb-4">Adicionar Novidade</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Título</label>
                    <Input
                      value={newsForm.title}
                      onChange={(e) => setNewsForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="Título da novidade"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Conteúdo</label>
                    <textarea
                      value={newsForm.content}
                      onChange={(e) => setNewsForm(f => ({ ...f, content: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background min-h-[100px]"
                      placeholder="Escreve o conteúdo da novidade..."
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-1">
                      <Image className="w-4 h-4" /> Imagem (opcional)
                    </label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewsForm(f => ({ ...f, image: reader.result as string }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="cursor-pointer"
                    />
                    {newsForm.image && (
                      <div className="mt-2">
                        <img src={newsForm.image} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                      </div>
                    )}
                  </div>
                  <Button onClick={handleAddNews} disabled={!newsForm.title || !newsForm.content}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Novidade
                  </Button>
                </div>
              </div>

              <div className="space-y-4 max-w-2xl">
                {news.map(item => (
                  <div key={item.id} className="bg-card rounded-xl p-4 shadow-sm border border-border">
                    <div className="flex items-start gap-4">
                      {item.image && (
                        <img src={item.image} alt="" className="w-20 h-20 object-cover rounded-lg shrink-0" />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(item.date).toLocaleDateString('pt-PT')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setNews(news.filter(n => n.id !== item.id));
                          toast({ title: 'Novidade eliminada' });
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                {news.length === 0 && (
                  <div className="bg-card rounded-xl p-8 text-center text-muted-foreground border border-border">
                    Sem novidades ainda
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-display font-bold text-foreground">Definições</h1>
              
              <div className="grid gap-6 max-w-2xl">
                <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                  <h2 className="font-semibold text-foreground mb-4">Loja</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nome da Loja</label>
                      <Input defaultValue="FIO & ALMA STUDIO" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email de Contacto</label>
                      <Input defaultValue="suporte@fioealma.com" type="email" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Moeda</label>
                      <select className="w-full h-10 px-3 rounded-lg border border-border bg-background">
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                  <h2 className="font-semibold text-foreground mb-4">Segurança</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Autenticação 2FA</p>
                        <p className="text-sm text-muted-foreground">Adiciona uma camada extra de segurança</p>
                      </div>
                      <Button variant="outline" size="sm">Ativar</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Alterar Password</p>
                        <p className="text-sm text-muted-foreground">Atualiza a password de admin</p>
                      </div>
                      <Button variant="outline" size="sm">Alterar</Button>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                  <h2 className="font-semibold text-foreground mb-4">Cookies e Privacidade</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Banner de Cookies</p>
                        <p className="text-sm text-muted-foreground">Mostra aviso de cookies aos visitantes</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Analytics</p>
                        <p className="text-sm text-muted-foreground">Recolhe dados anónimos de uso</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                    </div>
                  </div>
                </div>

                <Button className="w-fit" onClick={() => toast({ title: 'Definições guardadas!' })}>
                  Guardar Alterações
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;
