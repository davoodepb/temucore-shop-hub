import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface UserData {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const getUsers = (): UserData[] => {
    const saved = localStorage.getItem('users');
    return saved ? JSON.parse(saved) : [];
  };

  const saveUsers = (users: UserData[]) => {
    localStorage.setItem('users', JSON.stringify(users));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (isLogin) {
        // Login
        const users = getUsers();
        const user = users.find(u => u.email === formData.email);
        
        if (!user) {
          setError('Email não encontrado. Regista-te primeiro.');
          setIsLoading(false);
          return;
        }

        if (user.password !== formData.password) {
          setError('Password incorreta.');
          setIsLoading(false);
          return;
        }

        // Success - save session
        localStorage.setItem('currentUser', JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
        }));

        toast({ title: `Bem-vindo, ${user.name}!` });
        navigate('/');
      } else {
        // Register
        if (formData.password !== formData.confirmPassword) {
          setError('As passwords não coincidem.');
          setIsLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError('A password deve ter pelo menos 6 caracteres.');
          setIsLoading(false);
          return;
        }

        const users = getUsers();
        const exists = users.find(u => u.email === formData.email);

        if (exists) {
          setError('Este email já está registado.');
          setIsLoading(false);
          return;
        }

        const newUser: UserData = {
          id: Date.now().toString(),
          name: formData.name,
          email: formData.email,
          password: formData.password,
          createdAt: new Date().toISOString(),
        };

        saveUsers([...users, newUser]);

        localStorage.setItem('currentUser', JSON.stringify({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        }));

        toast({ title: 'Conta criada com sucesso!' });
        navigate('/');
      }

      setIsLoading(false);
    }, 800);
  };

  return (
    <>
      <Helmet>
        <title>{isLogin ? 'Login' : 'Registo'} | MegaShop</title>
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" />
            Voltar à loja
          </Link>

          <div className="bg-card rounded-2xl p-8 shadow-xl border border-border">
            <div className="flex items-center justify-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-r from-primary to-red-500 rounded-2xl flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">M</span>
              </div>
            </div>

            <h1 className="text-2xl font-display font-bold text-center text-foreground mb-2">
              {isLogin ? 'Bem-vindo de volta!' : 'Criar conta'}
            </h1>
            <p className="text-center text-muted-foreground text-sm mb-6">
              {isLogin ? 'Entra na tua conta para continuar' : 'Regista-te para começar a comprar'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Nome</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                      placeholder="O teu nome"
                      className="pl-10 h-12"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))}
                    placeholder="email@exemplo.com"
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(f => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Confirmar Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(f => ({ ...f, confirmPassword: e.target.value }))}
                      placeholder="••••••••"
                      className="pl-10 h-12"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-3 rounded-lg animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <Button type="submit" variant="deal" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="animate-pulse">A processar...</span>
                ) : isLogin ? (
                  'Entrar'
                ) : (
                  'Criar conta'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-sm text-primary hover:underline"
              >
                {isLogin ? 'Não tens conta? Regista-te' : 'Já tens conta? Faz login'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;
