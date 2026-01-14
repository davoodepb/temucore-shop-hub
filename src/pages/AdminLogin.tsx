import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, AlertCircle, Mail, Lock, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '@/contexts/StoreContext';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Palavra-passe deve ter pelo menos 6 caracteres" })
});

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const { adminLogin, isAdminLoggedIn, isLoading: authLoading } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && isAdminLoggedIn) {
      navigate('/admin');
    }
  }, [isAdminLoggedIn, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate input
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    if (isSignUp) {
      // Sign up flow
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin-login`
        }
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        setSignUpSuccess(true);
      }
      setIsLoading(false);
    } else {
      // Login flow
      const result = await adminLogin(email, password);
      if (result.success) {
        navigate('/admin');
      } else {
        setError(result.message);
      }
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-stone-900 to-stone-950 flex items-center justify-center">
        <div className="animate-pulse text-amber-200">A carregar...</div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-script text-foreground">
                {isSignUp ? 'Criar Conta Admin' : 'Acesso Admin'}
              </h1>
              <p className="text-muted-foreground text-sm mt-2">
                {isSignUp 
                  ? 'Cria uma conta para aceder ao painel' 
                  : 'Introduz os teus dados para continuar'}
              </p>
            </div>

            {signUpSuccess ? (
              <div className="text-center space-y-4">
                <div className="bg-success/10 text-success px-4 py-3 rounded-lg">
                  <p className="font-medium">Conta criada com sucesso!</p>
                  <p className="text-sm mt-1">
                    Contacta o administrador para ativar as permissões de admin.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsSignUp(false);
                    setSignUpSuccess(false);
                  }}
                >
                  Fazer Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@exemplo.com"
                      className="h-12 pl-10"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Palavra-passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Introduz a palavra-passe"
                      className="h-12 pl-10"
                    />
                  </div>
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
                  disabled={isLoading || !email || !password}
                >
                  {isLoading ? (
                    <span className="animate-pulse">A verificar...</span>
                  ) : isSignUp ? (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Criar Conta
                    </>
                  ) : (
                    'Aceder ao Dashboard'
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError('');
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isSignUp 
                      ? 'Já tens conta? Faz login' 
                      : 'Não tens conta? Cria uma'}
                  </button>
                </div>
              </form>
            )}

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