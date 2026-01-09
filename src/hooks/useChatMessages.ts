import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  customerEmail: string;
  customerName: string;
  message: string;
  sender: 'customer' | 'admin';
  isRead: boolean;
  createdAt: string;
}

interface DbChatMessage {
  id: string;
  customer_email: string;
  customer_name: string;
  message: string;
  sender: string;
  is_read: boolean;
  created_at: string;
}

const mapDbToMessage = (db: DbChatMessage): ChatMessage => ({
  id: db.id,
  customerEmail: db.customer_email,
  customerName: db.customer_name,
  message: db.message,
  sender: db.sender as 'customer' | 'admin',
  isRead: db.is_read,
  createdAt: db.created_at,
});

export const useChatMessages = (customerEmail?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    if (!customerEmail) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('customer_email', customerEmail)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages((data as DbChatMessage[]).map(mapDbToMessage));
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    if (!customerEmail) return;

    // Subscribe to realtime updates
    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `customer_email=eq.${customerEmail}`,
        },
        (payload) => {
          const newMessage = mapDbToMessage(payload.new as DbChatMessage);
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [customerEmail]);

  const sendMessage = async (text: string, customerName: string) => {
    if (!customerEmail) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          customer_email: customerEmail,
          customer_name: customerName,
          message: text,
          sender: 'customer',
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    refetch: fetchMessages,
  };
};

export const useAllChats = () => {
  const [chats, setChats] = useState<Record<string, { name: string; messages: ChatMessage[]; unreadCount: number }>>({});
  const [loading, setLoading] = useState(true);

  const fetchAllChats = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const chatMap: Record<string, { name: string; messages: ChatMessage[]; unreadCount: number }> = {};
      
      (data as DbChatMessage[]).forEach(msg => {
        const mappedMsg = mapDbToMessage(msg);
        if (!chatMap[msg.customer_email]) {
          chatMap[msg.customer_email] = {
            name: msg.customer_name,
            messages: [],
            unreadCount: 0,
          };
        }
        chatMap[msg.customer_email].messages.push(mappedMsg);
        if (!msg.is_read && msg.sender === 'customer') {
          chatMap[msg.customer_email].unreadCount++;
        }
      });

      setChats(chatMap);
    } catch (error) {
      console.error('Error fetching all chats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllChats();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('all-chat-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
        },
        () => {
          fetchAllChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sendAdminReply = async (customerEmail: string, customerName: string, text: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          customer_email: customerEmail,
          customer_name: customerName,
          message: text,
          sender: 'admin',
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending admin reply:', error);
      throw error;
    }
  };

  const markAsRead = async (customerEmail: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('customer_email', customerEmail)
        .eq('sender', 'customer');

      if (error) throw error;
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  return {
    chats,
    loading,
    sendAdminReply,
    markAsRead,
    refetch: fetchAllChats,
  };
};
