import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '@/contexts/StoreContext';

const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { adminLogin, isAdminLoggedIn } = useStore();
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAdminLoggedIn) {
      navigate('/admin');
    }
  }, [isAdminLoggedIn, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (adminLogin(password, password2)) {
        navigate('/admin');
      } else {
        setError('Palavras-passe inválidas. Acesso negado.');
        setPassword('');
        setPassword2('');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <>
      <Helmet>
        <title>Admin Login | FIO & ALMA STUDIO</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-stone-900 to-stone-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-amber-200/70 hover:text-amber-100 mb-8">
            <ArrowLeft className="w-4 h-4" />
            Voltar à Loja
          </Link>

          <div className="bg-card rounded-2xl p-8 shadow-2xl border border-border">
            <div className="flex flex-col items-center mb-8">
              <img 
                src="/images/logo.jpg" 
                alt="FIO & ALMA STUDIO" 
                className="w-20 h-20 rounded-full object-cover shadow-lg mb-4"
              />
              <h1 className="text-2xl font-script text-foreground">Acesso Admin</h1>
              <p className="text-muted-foreground text-sm mt-2">Introduz as palavras-passe para continuar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Primeira Palavra-passe
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Introduz a primeira palavra-passe"
                  className="h-12"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Segunda Palavra-passe
                </label>
                <Input
                  type="password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  placeholder="Introduz a segunda palavra-passe"
                  className="h-12"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-3 rounded-lg animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                variant="default"
                size="lg"
                className="w-full bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900"
                disabled={isLoading || !password || !password2}
              >
                {isLoading ? (
                  <span className="animate-pulse">A verificar...</span>
                ) : (
                  'Aceder ao Dashboard'
                )}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-6">
              Esta área está restrita apenas a pessoal autorizado.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
