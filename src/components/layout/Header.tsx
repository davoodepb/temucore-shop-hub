import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, Zap, User, Package, LogOut, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '@/contexts/StoreContext';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onOpenChat?: () => void;
}

interface CurrentUser {
  id: string;
  name: string;
  email: string;
}

export const Header: React.FC<HeaderProps> = ({ onSearch, onOpenChat }) => {
  const { getCartItemCount } = useStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const cartItemCount = getCartItemCount();

  useEffect(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      setCurrentUser(JSON.parse(saved));
    }

    // Listen for storage changes (when user logs in/out)
    const handleStorageChange = () => {
      const saved = localStorage.getItem('currentUser');
      if (saved) {
        setCurrentUser(JSON.parse(saved));
      } else {
        setCurrentUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogoClick = () => {
    const now = Date.now();
    if (now - lastClickTime < 500) {
      setClickCount(prev => prev + 1);
    } else {
      setClickCount(1);
    }
    setLastClickTime(now);

    if (clickCount >= 4) {
      navigate('/admin-login');
      setClickCount(0);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      {/* Top banner */}
      <div className="bg-gradient-to-r from-primary to-red-500 text-primary-foreground py-1.5 px-4">
        <div className="container flex items-center justify-center gap-2 text-sm font-medium">
          <Zap className="w-4 h-4 animate-bounce" />
          <span>ENVIO GRÁTIS em compras acima de €35 • Até 90% DESCONTO em Flash Deals!</span>
          <Zap className="w-4 h-4 animate-bounce" />
        </div>
      </div>

      <div className="container">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link 
            to="/" 
            onClick={handleLogoClick}
            className="flex items-center gap-2 select-none"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-amber-600 to-amber-800 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold text-primary-foreground">F</span>
            </div>
            <span className="text-xl font-display font-bold text-foreground hidden sm:block">
              FIO & ALMA<span className="text-primary"> STUDIO</span>
            </span>
          </Link>

          {/* Search - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Pesquisar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-11 bg-muted/50 border-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Chat Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenChat}
              className="relative"
              title="Chat com Suporte"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>

            {/* User Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => currentUser ? setIsUserMenuOpen(!isUserMenuOpen) : navigate('/auth')}
              >
                <User className="w-5 h-5" />
              </Button>

              {isUserMenuOpen && currentUser && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-card rounded-xl shadow-xl border border-border py-2 animate-fade-in z-50">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="font-medium text-foreground truncate">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
                  </div>
                  <Link
                    to="/my-orders"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Package className="w-4 h-4" />
                    Meus Pedidos
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-muted"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              )}
            </div>

            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center animate-scale-in">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className={cn(
          "md:hidden pb-4 transition-all duration-300",
          isMobileMenuOpen ? "block" : "hidden"
        )}>
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Pesquisar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-11 bg-muted/50 border-none"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Categories bar */}
      <div className="border-t border-border bg-muted/30">
        <div className="container">
          <nav className="flex items-center gap-1 py-2 overflow-x-auto scrollbar-hide">
            {['Todos', 'Eletrónica', 'Moda', 'Casa', 'Flash Deals'].map((cat) => (
              <Button
                key={cat}
                variant={cat === 'Flash Deals' ? 'deal' : 'ghost'}
                size="sm"
                className={cn(
                  "whitespace-nowrap",
                  cat === 'Flash Deals' && "animate-none"
                )}
                onClick={() => {
                  const searchMap: Record<string, string> = {
                    'Todos': '',
                    'Eletrónica': 'Electronics',
                    'Moda': 'Fashion',
                    'Casa': 'Home',
                    'Flash Deals': 'Flash Deals'
                  };
                  onSearch?.(searchMap[cat] || '');
                }}
              >
                {cat === 'Flash Deals' && <Zap className="w-3 h-3" />}
                {cat}
              </Button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};
