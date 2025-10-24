import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { queryClient } from '@/lib/queryClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Search, UserPlus, X } from 'lucide-react';
import type { Profile } from '@shared/schema';

export default function SearchPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: searchResults } = useQuery<Profile[]>({
    queryKey: ['/api/search-users', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim() || !user) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .ilike('name', `%${searchQuery}%`)
        .limit(20);

      if (error) throw error;
      return data || [];
    },
    enabled: searchQuery.trim().length > 0,
  });

  const { data: existingFriends } = useQuery<string[]>({
    queryKey: ['/api/my-friends'],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('friendships')
        .select('friend_id')
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (error) throw error;
      return (data || []).map(f => f.friend_id);
    },
    enabled: !!user,
  });

  const addFriendMutation = useMutation({
    mutationFn: async (friendId: string) => {
      if (!user) return;

      // Use the database function to create mutual friendship and chat
      const { data, error } = await supabase.rpc('create_friendship', {
        friend_user_id: friendId,
      });

      if (error) throw error;
      return data; // Returns the chat ID
    },
    onSuccess: (chatId) => {
      toast({
        title: 'Friend Added!',
        description: 'You can now start chatting',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/my-friends'] });
      queryClient.invalidateQueries({ queryKey: ['/api/chats'] });
      setLocation(`/chat/${chatId}`);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add friend',
        variant: 'destructive',
      });
    },
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isFriend = (userId: string) => {
    return existingFriends?.includes(userId);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b bg-background">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/')}
            data-testid="button-close-search"
          >
            <X className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Find Friends</h1>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name..."
            className="pl-10"
            data-testid="input-search"
            autoFocus
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {searchQuery.trim() === '' ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Start typing to search for users</p>
          </div>
        ) : searchResults && searchResults.length > 0 ? (
          <div className="divide-y">
            {searchResults.map((result) => (
              <div
                key={result.id}
                className="flex items-center gap-3 p-4 hover-elevate"
                data-testid={`search-result-${result.id}`}
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage src={result.avatar_url || undefined} />
                  <AvatarFallback>{getInitials(result.name)}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{result.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{result.email}</p>
                </div>

                {isFriend(result.id) ? (
                  <Button variant="secondary" size="sm" disabled>
                    Friends
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => addFriendMutation.mutate(result.id)}
                    disabled={addFriendMutation.isPending}
                    data-testid={`button-add-${result.id}`}
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}
