import { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Camera, LogOut, Shield, MessageSquare, Trophy } from 'lucide-react';
import type { BlockedUser } from '@shared/schema';

export default function ProfilePage() {
  const { user, profile, signOut } = useAuthStore();
  const { toast } = useToast();
  const [editName, setEditName] = useState(profile?.name || '');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [blockedDialogOpen, setBlockedDialogOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: stats } = useQuery({
    queryKey: ['/api/user-stats'],
    queryFn: async () => {
      if (!user) return null;

      const { count: messageCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', user.id);

      const { data: rankData } = await supabase.rpc('get_rankings', {
        period_type: 'daily',
      });

      const userRank = rankData?.find((r: any) => r.user_id === user.id);

      return {
        messageCount: messageCount || 0,
        currentRank: userRank?.rank || null,
      };
    },
    enabled: !!user,
  });

  const { data: blockedUsers } = useQuery<BlockedUser[]>({
    queryKey: ['/api/blocked-users'],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('blocked_users')
        .select(`
          id,
          blocked_id,
          created_at,
          profiles:blocked_id (
            name,
            avatar_url
          )
        `)
        .eq('blocker_id', user.id);

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        blocker_id: user.id,
        blocked_id: item.blocked_id,
        blocked_name: item.profiles?.name || 'Unknown',
        blocked_avatar: item.profiles?.avatar_url || null,
        created_at: item.created_at,
      }));
    },
    enabled: !!user && blockedDialogOpen,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;

      let avatarUrl = profile?.avatar_url;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, avatarFile);

        if (!uploadError) {
          const { data } = supabase.storage.from('media').getPublicUrl(filePath);
          avatarUrl = data.publicUrl;
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          name: editName.trim(),
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully',
      });
      setEditDialogOpen(false);
      setAvatarFile(null);
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
      window.location.reload(); // Refresh to update auth store
    },
    onError: () => {
      toast({
        title: 'Update Failed',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    },
  });

  const unblockMutation = useMutation({
    mutationFn: async (blockedUserId: string) => {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('id', blockedUserId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'User Unblocked',
        description: 'User has been unblocked successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/blocked-users'] });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/auth';
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">
                {getInitials(profile?.name || 'U')}
              </AvatarFallback>
            </Avatar>

            <div className="text-center">
              <h2 className="text-xl font-semibold" data-testid="text-profile-name">{profile?.name}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>

            {stats && (
              <div className="flex gap-8 mt-2">
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <p className="text-2xl font-bold">{stats.messageCount}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Messages</p>
                </div>
                {stats.currentRank && (
                  <div className="text-center">
                    <div className="flex items-center gap-1 justify-center">
                      <Trophy className="w-4 h-4 text-muted-foreground" />
                      <p className="text-2xl font-bold">#{stats.currentRank}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Daily Rank</p>
                  </div>
                )}
              </div>
            )}

            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" data-testid="button-edit-profile">
                  <Camera className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Name</Label>
                    <Input
                      id="edit-name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      data-testid="input-edit-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Profile Picture</Label>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                      data-testid="button-change-avatar"
                    >
                      {avatarFile ? avatarFile.name : 'Choose New Picture'}
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
                <DialogFooter>
                  <Button
                    onClick={() => updateProfileMutation.mutate()}
                    disabled={updateProfileMutation.isPending}
                    data-testid="button-save-profile"
                  >
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Dialog open={blockedDialogOpen} onOpenChange={setBlockedDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start h-12"
                data-testid="button-blocked-contacts"
              >
                <Shield className="w-5 h-5 mr-3" />
                Blocked Contacts
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Blocked Contacts</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {blockedUsers && blockedUsers.length > 0 ? (
                  blockedUsers.map((blocked) => (
                    <div
                      key={blocked.id}
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={blocked.blocked_avatar || undefined} />
                          <AvatarFallback>{getInitials(blocked.blocked_name)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{blocked.blocked_name}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => unblockMutation.mutate(blocked.id)}
                        data-testid={`button-unblock-${blocked.id}`}
                      >
                        Unblock
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No blocked contacts
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Separator />

          <Button
            variant="ghost"
            className="w-full justify-start h-12 text-destructive hover:text-destructive"
            onClick={handleSignOut}
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
