import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users, Star, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Order {
  id: string;
  total: number;
  status: string;
  date: string;
  items: { product: { category: string }; quantity: number }[];
}

interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
}

interface Review {
  id: string;
  rating: number;
  isApproved: boolean;
}

interface AnalyticsChartsProps {
  orders: Order[];
  products: Product[];
  reviews: Review[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--accent))'];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ orders, products, reviews }) => {
  // Calculate analytics data
  const analytics = useMemo(() => {
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    // Revenue by day
    const revenueByDay = last7Days.map(date => {
      const dayOrders = orders.filter(o => 
        o.date.split('T')[0] === date && 
        ['paid', 'shipped', 'delivered'].includes(o.status)
      );
      return {
        name: new Date(date).toLocaleDateString('pt-PT', { weekday: 'short' }),
        revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
        orders: dayOrders.length,
      };
    });

    // Category distribution
    const categoryCount: Record<string, number> = {};
    products.forEach(p => {
      categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
    });
    const categoryData = Object.entries(categoryCount).map(([name, value]) => ({ name, value }));

    // Order status distribution
    const statusCount: Record<string, number> = {};
    orders.forEach(o => {
      statusCount[o.status] = (statusCount[o.status] || 0) + 1;
    });
    const statusData = Object.entries(statusCount).map(([name, value]) => ({ 
      name: name.charAt(0).toUpperCase() + name.slice(1), 
      value 
    }));

    // Top products by stock sold (simulated)
    const topProducts = products
      .map(p => ({ name: p.name.slice(0, 20), stock: p.stock, value: Math.max(0, 100 - p.stock) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Rating distribution
    const ratingCount = [0, 0, 0, 0, 0];
    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        ratingCount[r.rating - 1]++;
      }
    });
    const ratingData = ratingCount.map((count, i) => ({ name: `${i + 1}★`, value: count }));

    // Conversion funnel (simulated)
    const totalVisitors = Math.max(orders.length * 10, 100);
    const cartAdds = Math.floor(totalVisitors * 0.4);
    const checkouts = Math.floor(cartAdds * 0.6);
    const purchases = orders.filter(o => o.status !== 'cancelled').length;
    
    const funnelData = [
      { name: 'Visitantes', value: totalVisitors, fill: 'hsl(var(--primary))' },
      { name: 'Add Carrinho', value: cartAdds, fill: 'hsl(var(--warning))' },
      { name: 'Checkout', value: checkouts, fill: 'hsl(var(--accent))' },
      { name: 'Compras', value: purchases, fill: 'hsl(var(--success))' },
    ];

    // Total calculations
    const totalRevenue = orders
      .filter(o => ['paid', 'shipped', 'delivered'].includes(o.status))
      .reduce((sum, o) => sum + o.total, 0);
    
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0;
    const conversionRate = totalVisitors > 0 ? (purchases / totalVisitors * 100) : 0;

    return {
      revenueByDay,
      categoryData,
      statusData,
      topProducts,
      ratingData,
      funnelData,
      totalRevenue,
      avgOrderValue,
      avgRating,
      conversionRate,
      totalOrders: orders.length,
      totalProducts: products.length,
    };
  }, [orders, products, reviews]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Receita Total"
          value={`€${analytics.totalRevenue.toFixed(2)}`}
          change={12.5}
          icon={DollarSign}
          color="text-success"
        />
        <KPICard
          title="Total Pedidos"
          value={analytics.totalOrders.toString()}
          change={8.2}
          icon={ShoppingCart}
          color="text-primary"
        />
        <KPICard
          title="Valor Médio"
          value={`€${analytics.avgOrderValue.toFixed(2)}`}
          change={-2.4}
          icon={Package}
          color="text-warning"
        />
        <KPICard
          title="Taxa Conversão"
          value={`${analytics.conversionRate.toFixed(1)}%`}
          change={5.1}
          icon={Users}
          color="text-accent"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h3 className="font-display font-bold text-foreground mb-4">Receita (Últimos 7 dias)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.revenueByDay}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                  formatter={(value: number) => [`€${value.toFixed(2)}`, 'Receita']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders per Day */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h3 className="font-display font-bold text-foreground mb-4">Pedidos por Dia</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Category Distribution */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h3 className="font-display font-bold text-foreground mb-4">Produtos por Categoria</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analytics.categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {analytics.categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
                <span className="text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h3 className="font-display font-bold text-foreground mb-4">Estado dos Pedidos</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analytics.statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {analytics.statusData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
                <span className="text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ratings Distribution */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h3 className="font-display font-bold text-foreground mb-4">Distribuição de Avaliações</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.ratingData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={30} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="value" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm text-muted-foreground">
              Média: {analytics.avgRating.toFixed(1)} estrelas
            </span>
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <h3 className="font-display font-bold text-foreground mb-4">Funil de Conversão</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.funnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {analytics.funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <h3 className="font-display font-bold text-foreground mb-4">Top Produtos (por vendas estimadas)</h3>
        <div className="space-y-3">
          {analytics.topProducts.map((product, index) => (
            <div key={index} className="flex items-center gap-4">
              <span className="text-lg font-bold text-muted-foreground w-6">#{index + 1}</span>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">{product.name}...</p>
                <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-red-500 rounded-full transition-all"
                    style={{ width: `${Math.min(product.value, 100)}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-medium text-muted-foreground">{product.value} vendidos</span>
            </div>
          ))}
          {analytics.topProducts.length === 0 && (
            <p className="text-muted-foreground text-center py-4">Sem dados de vendas</p>
          )}
        </div>
      </div>
    </div>
  );
};

// KPI Card Component
interface KPICardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, change, icon: Icon, color }) => {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-3">
        <span className="text-muted-foreground text-sm font-medium">{title}</span>
        <Icon className={cn("w-5 h-5", color)} />
      </div>
      <p className="text-2xl font-bold text-foreground mb-2">{value}</p>
      <div className={cn(
        "flex items-center gap-1 text-xs font-medium",
        isPositive ? "text-success" : "text-destructive"
      )}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        <span>{isPositive ? '+' : ''}{change}% vs mês anterior</span>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
