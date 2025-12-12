import React, { useState, useEffect } from 'react';
import { Cookie, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allConsent = { essential: true, analytics: true, marketing: true };
    localStorage.setItem('cookie_consent', JSON.stringify(allConsent));
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookie_consent', JSON.stringify(preferences));
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const minimalConsent = { essential: true, analytics: false, marketing: false };
    localStorage.setItem('cookie_consent', JSON.stringify(minimalConsent));
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-4 animate-slide-up">
      <div className="container max-w-4xl mx-auto">
        <div className="bg-card border border-border rounded-2xl shadow-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <Cookie className="w-6 h-6 text-primary" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-bold text-foreground">🍪 Utilizamos cookies</h3>
                <button onClick={handleRejectAll} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                Utilizamos cookies para melhorar a tua experiência, analisar o tráfego e personalizar conteúdo. 
                Podes gerir as tuas preferências ou aceitar todos os cookies.
              </p>

              {showSettings && (
                <div className="space-y-3 mb-4 p-4 bg-muted/50 rounded-xl">
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium">Essenciais (obrigatório)</span>
                    <input type="checkbox" checked disabled className="rounded" />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm">Analytics</span>
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences(p => ({ ...p, analytics: e.target.checked }))}
                      className="rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm">Marketing</span>
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => setPreferences(p => ({ ...p, marketing: e.target.checked }))}
                      className="rounded"
                    />
                  </label>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
                  <Settings className="w-4 h-4 mr-1" />
                  {showSettings ? 'Fechar' : 'Preferências'}
                </Button>
                {showSettings && (
                  <Button variant="outline" size="sm" onClick={handleSavePreferences}>
                    Guardar preferências
                  </Button>
                )}
                <Button variant="default" size="sm" onClick={handleAcceptAll}>
                  Aceitar todos
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
