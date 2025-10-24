import { useState, useEffect, useRef } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, Camera, Image as ImageIcon, Mic, Check, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Message, Profile } from '@shared/schema';

export default function ChatDetailPage() {
  const [, params] = useRoute('/chat/:id');
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [recording, setRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const chatId = params?.id;

  const { data: chat } = useQuery({
    queryKey: ['/api/chats', chatId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!chatId,
  });

  const { data: friendProfile } = useQuery<Profile>({
    queryKey: ['/api/profiles', chat?.user1_id === user?.id ? chat?.user2_id : chat?.user1_id],
    queryFn: async () => {
      const friendId = chat!.user1_id === user!.id ? chat!.user2_id : chat!.user1_id;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', friendId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!chat && !!user,
  });

  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ['/api/messages', chatId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Mark messages as read
      if (user) {
        await supabase
          .from('messages')
          .update({ read: true })
          .eq('chat_id', chatId)
          .eq('receiver_id', user.id)
          .eq('read', false);
      }

      return data;
    },
    enabled: !!chatId && !!user,
  });

  // Real-time subscription
  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['/api/messages', chatId] });
          queryClient.invalidateQueries({ queryKey: ['/api/chats'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['/api/messages', chatId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user || !chat || !friendProfile) return;

      const receiverId = chat.user1_id === user.id ? chat.user2_id : chat.user1_id;

      const { error } = await supabase.from('messages').insert({
        chat_id: chatId,
        sender_id: user.id,
        receiver_id: receiverId,
        content,
        type: 'text',
        read: false,
      });

      if (error) throw error;

      // Update chat last message
      await supabase
        .from('chats')
        .update({
          last_message: content.slice(0, 100),
          last_message_at: new Date().toISOString(),
        })
        .eq('id', chatId);
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['/api/messages', chatId] });
      queryClient.invalidateQueries({ queryKey: ['/api/chats'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    },
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message.trim());
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !chat) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `chat-media/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file);

    if (uploadError) {
      toast({
        title: 'Upload Failed',
        description: uploadError.message,
        variant: 'destructive',
      });
      return;
    }

    const { data } = supabase.storage.from('media').getPublicUrl(filePath);
    
    const receiverId = chat.user1_id === user.id ? chat.user2_id : chat.user1_id;

    await supabase.from('messages').insert({
      chat_id: chatId,
      sender_id: user.id,
      receiver_id: receiverId,
      content: file.name,
      type: 'image',
      media_url: data.publicUrl,
      read: false,
    });

    queryClient.invalidateQueries({ queryKey: ['/api/messages', chatId] });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading || !friendProfile) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex items-center gap-3 p-4 border-b">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className={`h-12 ${i % 2 === 0 ? 'ml-auto w-48' : 'w-48'}`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-background">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation('/')}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <Avatar className="w-10 h-10">
          <AvatarImage src={friendProfile.avatar_url || undefined} />
          <AvatarFallback>{getInitials(friendProfile.name)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h2 className="font-medium truncate" data-testid="text-chat-name">{friendProfile.name}</h2>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((msg) => {
          const isSent = msg.sender_id === user?.id;
          return (
            <div
              key={msg.id}
              className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
              data-testid={`message-${msg.id}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                  isSent
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted rounded-bl-sm'
                }`}
              >
                {msg.type === 'image' && msg.media_url && (
                  <img
                    src={msg.media_url}
                    alt={msg.content || 'Image'}
                    className="rounded-lg max-h-64 mb-1"
                  />
                )}
                {msg.content && <p className="text-sm break-words">{msg.content}</p>}
                <div className={`flex items-center gap-1 mt-1 ${isSent ? 'justify-end' : ''}`}>
                  <span className={`text-xs ${isSent ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: false })}
                  </span>
                  {isSent && (
                    <span className="text-primary-foreground/70">
                      {msg.read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-background">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            data-testid="button-attach"
          >
            <ImageIcon className="w-5 h-5" />
          </Button>
          
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1"
            data-testid="input-message"
          />
          
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!message.trim() || sendMessageMutation.isPending}
            data-testid="button-send"
          >
            <Send className="w-5 h-5" />
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      </div>
    </div>
  );
}
