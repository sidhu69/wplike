import { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Upload, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [debugMessage, setDebugMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setDebugMessage('Image selected: ' + file.name);
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;

    try {
      setDebugMessage('Uploading image...');
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, avatarFile);

      if (uploadError) {
        setDebugMessage('Upload error: ' + uploadError.message);
        toast({
          title: 'Upload Failed',
          description: uploadError.message,
          variant: 'destructive',
        });
        return null;
      }

      const { data } = supabase.storage.from('media').getPublicUrl(filePath);
      setDebugMessage('Image uploaded successfully!');
      return data.publicUrl;
    } catch (err: any) {
      setDebugMessage('Upload exception: ' + err.message);
      return null;
    }
  };

  const handleComplete = async () => {
    try {
      setDebugMessage('Starting profile creation...');
      
      if (!name.trim()) {
        setDebugMessage('Name is required!');
        toast({
          title: 'Name Required',
          description: 'Please enter your name to continue',
          variant: 'destructive',
        });
        return;
      }

      if (!user) {
        setDebugMessage('No user found! Please log in again.');
        toast({
          title: 'Error',
          description: 'User session not found. Please log in again.',
          variant: 'destructive',
        });
        return;
      }

      setLoading(true);
      setDebugMessage('User ID: ' + user.id);

      let uploadedAvatarUrl = null;
      if (avatarFile) {
        setDebugMessage('Uploading avatar...');
        uploadedAvatarUrl = await uploadAvatar();
        if (avatarFile && !uploadedAvatarUrl) {
          setLoading(false);
          return;
        }
      } else {
        setDebugMessage('No avatar selected, skipping upload');
      }

      setDebugMessage('Saving profile to database...');
      
      const profileData = {
        id: user.id,
        name: name.trim(),
        avatar_url: uploadedAvatarUrl,
        updated_at: new Date().toISOString(),
      };

      setDebugMessage('Profile data: ' + JSON.stringify(profileData));

      const { error, data } = await supabase
        .from('profiles')
        .upsert(profileData)
        .select();

      if (error) {
        setDebugMessage('Database error: ' + error.message);
        console.error('Profile save error:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to save profile. Please try again.',
          variant: 'destructive',
        });
        setLoading(false);
      } else {
        setDebugMessage('Profile saved successfully!');
        toast({
          title: 'Profile Created!',
          description: 'Welcome to ChatApp',
        });
        
        // Wait a moment for toast to show
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
    } catch (err: any) {
      setDebugMessage('Exception: ' + err.message);
      console.error('Exception:', err);
      toast({
        title: 'Unexpected Error',
        description: err.message,
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const getInitials = () => {
    return name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  };

  // Check if user exists
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No user session found. Please log in again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/10 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            {step === 1 ? 'Tell us your name' : 'Add a profile picture (optional)'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Debug Message */}
          {debugMessage && (
            <Alert>
              <AlertDescription className="text-xs">
                {debugMessage}
              </AlertDescription>
            </Alert>
          )}

          {step === 1 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && name.trim() && setStep(2)}
                  data-testid="input-name"
                  autoFocus
                />
              </div>
              <Button
                onClick={() => {
                  setDebugMessage('Moving to step 2 with name: ' + name);
                  setStep(2);
                }}
                className="w-full"
                disabled={!name.trim()}
                data-testid="button-continue"
              >
                Continue
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
                </Avatar>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDebugMessage('Opening file picker...');
                      fileInputRef.current?.click();
                    }}
                    data-testid="button-upload"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                  {avatarUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarUrl(null);
                        setDebugMessage('Avatar removed');
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDebugMessage('Back to step 1');
                    setStep(1);
                  }}
                  className="flex-1"
                  disabled={loading}
                  data-testid="button-back"
                >
                  Back
                </Button>
                <Button
                  onClick={() => {
                    setDebugMessage('Complete button clicked!');
                    handleComplete();
                  }}
                  className="flex-1"
                  disabled={loading}
                  data-testid="button-complete"
                >
                  {loading ? 'Saving...' : 'Complete'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
