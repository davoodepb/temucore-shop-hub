import React, { useState } from 'react';
import { X, Send, MessageCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  sender: 'customer' | 'admin';
  timestamp: Date;
}

interface ChatWidgetProps {
  customerName?: string;
  customerEmail?: string;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ customerName, customerEmail }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    if (!customerEmail) return [];
    const saved = localStorage.getItem(`chat_${customerEmail}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [inputText, setInputText] = useState('');
  const [isLoggedIn] = useState(!!customerEmail);

  const handleSend = () => {
    if (!inputText.trim() || !isLoggedIn) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'customer',
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem(`chat_${customerEmail}`, JSON.stringify(updatedMessages));
    setInputText('');

    // Simulate admin auto-reply
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Obrigado pela sua mensagem! A nossa equipa responderá em breve. 🛍️',
        sender: 'admin',
        timestamp: new Date(),
      };
      const withReply = [...updatedMessages, reply];
      setMessages(withReply);
      localStorage.setItem(`chat_${customerEmail}`, JSON.stringify(withReply));
    }, 1500);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-primary to-red-500 text-primary-foreground rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110",
          isOpen && "hidden"
        )}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-red-500 text-primary-foreground p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Suporte MegaShop</h3>
                <p className="text-xs opacity-80">Normalmente responde em minutos</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-primary-foreground/20 p-1 rounded">
              <X className="w-5 h-5" />
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
                <Button variant="default" size="sm" className="mt-3" onClick={() => window.location.href = '/auth'}>
                  Fazer Login
                </Button>
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
                  {msg.text}
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
                <Button size="icon" onClick={handleSend} disabled={!inputText.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
