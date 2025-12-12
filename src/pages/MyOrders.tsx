import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { cn } from '@/lib/utils';

const MyOrders: React.FC = () => {
  const { orders } = useStore();
  
  // Get current user
  const currentUser = localStorage.getItem('currentUser');
  const user = currentUser ? JSON.parse(currentUser) : null;
  
  // Filter orders for current user
  const userOrders = orders.filter(o => o.customerEmail === user?.email);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-warning" />;
      case 'paid': return <CheckCircle className="w-5 h-5 text-success" />;
      case 'shipped': return <Truck className="w-5 h-5 text-primary" />;
      case 'delivered': return <CheckCircle className="w-5 h-5 text-success" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-destructive" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'paid': return 'Pago';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <>
      <Helmet>
        <title>Meus Pedidos | MegaShop</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
          <div className="container flex items-center h-14">
            <Link to="/" className="flex items-center gap-2 text-foreground">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Voltar</span>
            </Link>
          </div>
        </header>

        <main className="container py-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-8">Meus Pedidos</h1>

          {!user ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-foreground mb-2">Faz login para ver os teus pedidos</p>
              <Link to="/auth">
                <button className="text-primary hover:underline">Entrar na conta</button>
              </Link>
            </div>
          ) : userOrders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-foreground mb-2">Ainda não tens pedidos</p>
              <p className="text-muted-foreground mb-6">Começa a comprar para ver os teus pedidos aqui!</p>
              <Link to="/">
                <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium">
                  Ver produtos
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userOrders.map((order) => (
                <div key={order.id} className="bg-card rounded-xl p-6 shadow-sm border border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="font-mono text-sm text-muted-foreground">Pedido #{order.id.slice(-8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.date).toLocaleDateString('pt-PT', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
                      order.status === 'paid' && "bg-success/10 text-success",
                      order.status === 'pending' && "bg-warning/10 text-warning",
                      order.status === 'shipped' && "bg-primary/10 text-primary",
                      order.status === 'delivered' && "bg-success/10 text-success",
                      order.status === 'cancelled' && "bg-destructive/10 text-destructive"
                    )}>
                      {getStatusIcon(order.status)}
                      {getStatusLabel(order.status)}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Qtd: {item.quantity} × ${item.product.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Total */}
                  <div className="flex justify-between items-center pt-4 border-t border-border">
                    <span className="font-medium text-foreground">Total</span>
                    <span className="text-xl font-bold text-primary">${order.total.toFixed(2)}</span>
                  </div>

                  {/* Tracking Info */}
                  {order.status === 'shipped' && (
                    <div className="mt-4 p-4 bg-primary/5 rounded-lg">
                      <p className="text-sm text-primary font-medium flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        O teu pedido está a caminho! Entrega estimada: 3-5 dias úteis
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default MyOrders;
