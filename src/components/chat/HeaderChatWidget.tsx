import React, { useState, useEffect } from 'react';
import { X, Send, MessageCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useChatMessages } from '@/hooks/useChatMessages';

interface HeaderChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  customerName?: string;
  customerEmail?: string;
}

export const HeaderChatWidget: React.FC<HeaderChatWidgetProps> = ({
  isOpen,
  onClose,
  customerName,
  customerEmail,
}) => {
  const [inputText, setInputText] = useState('');
  const { messages, sendMessage, loading } = useChatMessages(customerEmail);
  const isLoggedIn = !!customerEmail;

  const handleSend = async () => {
    if (!inputText.trim() || !isLoggedIn || !customerName) return;

    try {
      await sendMessage(inputText.trim(), customerName);
      setInputText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 right-4 z-50 w-80 sm:w-96 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in slide-in-from-top-2">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-amber-600 text-primary-foreground p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">Suporte FIO & ALMA</h3>
            <p className="text-xs opacity-80">Normalmente responde em minutos</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          aria-label="Fechar chat" 
          className="hover:bg-primary-foreground/20 p-1 rounded"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Messages */}
      <div className="h-72 overflow-y-auto p-4 space-y-3 bg-muted/30">
        {!isLoggedIn ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <User className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">
              Faça login para iniciar uma conversa com o suporte.
            </p>
            <Button 
              variant="default" 
              size="sm" 
              className="mt-3" 
              onClick={() => window.location.href = '/auth'}
            >
              Fazer Login
            </Button>
          </div>
        ) : loading ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            A carregar...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            Olá {customerName}! 👋<br />
            Como podemos ajudar?
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "max-w-[80%] p-3 rounded-2xl text-sm",
                msg.sender === 'customer'
                  ? "bg-primary text-primary-foreground ml-auto rounded-br-sm"
                  : "bg-card border border-border rounded-bl-sm"
              )}
            >
              {msg.message}
            </div>
          ))
        )}
      </div>

      {/* Input */}
      {isLoggedIn && (
        <div className="p-3 border-t border-border bg-card">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escreva uma mensagem..."
              className="flex-1 px-4 py-2 bg-muted rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <Button 
              size="icon" 
              onClick={handleSend} 
              disabled={!inputText.trim()} 
              aria-label="Enviar mensagem"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
