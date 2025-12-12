import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '@/contexts/StoreContext';

const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
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
      if (adminLogin(password)) {
        navigate('/admin');
      } else {
        setError('Invalid password. Access denied.');
        setPassword('');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <>
      <Helmet>
        <title>Admin Login | MegaShop</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Link>

          <div className="bg-card rounded-2xl p-8 shadow-2xl border border-border">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-gradient-deal rounded-2xl flex items-center justify-center mb-4 shadow-glow">
                <Lock className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground">Admin Access</h1>
              <p className="text-muted-foreground text-sm mt-2">Enter your password to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="h-12"
                  autoFocus
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
                variant="deal"
                size="lg"
                className="w-full"
                disabled={isLoading || !password}
              >
                {isLoading ? (
                  <span className="animate-pulse">Verifying...</span>
                ) : (
                  'Access Dashboard'
                )}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-6">
              This area is restricted to authorized personnel only.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
