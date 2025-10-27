import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MessageCircle, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { ChatWithProfile } from '@shared/schema';

export default function ChatsPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();

  const { data: chats, isLoading } = useQuery<ChatWithProfile[]>({
    queryKey: ['/api/chats'],
    queryFn: async () => {
      if (!user) return [];

      const { data: chatsData, error } = await supabase
        .from('chats')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) throw error;

      const chatsWithProfiles = await Promise.all(
        (chatsData || []).map(async (chat) => {
          const friendId = chat.user1_id === user.id ? chat.user2_id : chat.user1_id;

          const { data: friendProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', friendId)
            .single();

          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('chat_id', chat.id)
            .eq('receiver_id', user.id)
            .eq('read', false);

          return {
            ...chat,
            friend_profile: friendProfile!,
            unread_count: unreadCount || 0,
          };
        })
      );

      return chatsWithProfiles;
    },
    enabled: !!user,
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4 border-b">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!chats || chats.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageCircle className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">No conversations yet</h2>
            <p className="text-sm text-muted-foreground">
              Use the search icon to find and add friends
            </p>
          </div>
          <Button onClick={() => setLocation('/search')} className="gap-2">
            <Search className="w-4 h-4" />
            Find Friends
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {chats.map((chat) => (
        <div
          key={chat.id}
          onClick={() => setLocation(`/chat/${chat.id}`)}
          className="flex items-center gap-3 p-4 border-b hover:bg-accent cursor-pointer active:bg-accent/80"
          data-testid={`chat-item-${chat.id}`}
        >
          <Avatar className="w-12 h-12">
            <AvatarImage src={chat.friend_profile.avatar_url || undefined} />
            <AvatarFallback>{getInitials(chat.friend_profile.name)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="font-medium truncate">{chat.friend_profile.name}</h3>
              {chat.last_message_at && (
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {formatDistanceToNow(new Date(chat.last_message_at), { addSuffix: false })}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground truncate">
                {chat.last_message || 'Start a conversation'}
              </p>
              {chat.unread_count > 0 && (
                <Badge className="rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5" data-testid={`badge-unread-${chat.id}`}>
                  {chat.unread_count}
                </Badge>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
