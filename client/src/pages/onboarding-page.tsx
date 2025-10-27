import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { MessageCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { loginSchema, signupSchema, type LoginInput, type SignupInput } from '@shared/schema';

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { setUserAndProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [debugMessage, setDebugMessage] = useState<string>('');

  const [loginData, setLoginData] = useState<LoginInput>({
    email: '',
    password: '',
  });

  const [signupData, setSignupData] = useState<SignupInput>({
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setDebugMessage('Session found, redirecting...');
        setUserAndProfile(session.user, null);
        window.location.href = '/onboarding';
      }
    };
    checkSession();
  }, [setUserAndProfile]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = loginSchema.safeParse(loginData);
    if (!result.success) {
      toast({
        title: 'Validation Error',
        description: result.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setDebugMessage('Logging in...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password,
    });

    if (error) {
      setDebugMessage('Login error: ' + error.message);
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    } else if (data.user) {
      setDebugMessage('Login successful!');
      setUserAndProfile(data.user, null);
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      window.location.href = '/';
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = signupSchema.safeParse(signupData);
    if (!result.success) {
      toast({
        title: 'Validation Error',
        description: result.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setDebugMessage('Creating account...');
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });

      if (error) {
        setDebugMessage('Signup error: ' + error.message);
        toast({
          title: 'Signup Failed',
          description: error.message,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (!data.user) {
        setDebugMessage('No user data received');
        toast({
          title: 'Signup Failed',
          description: 'Could not create account. Try again.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      setDebugMessage('Account created! User ID: ' + data.user.id);

      // IMPORTANT: Set user in store immediately
      setUserAndProfile(data.user, null);

      // Create profile manually
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: data.user.email!,
        name: data.user.email!.split('@')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      setDebugMessage('Profile created! Redirecting...');
      
      toast({
        title: 'Account Created!',
        description: 'Complete your profile',
      });

      // Force redirect to onboarding
      setTimeout(() => {
        window.location.href = '/onboarding';
      }, 500);
      
    } catch (err: any) {
      setDebugMessage('Error: ' + err.message);
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/10 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-2">
            <MessageCircle className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">ChatApp</CardTitle>
          <CardDescription>Connect, chat, and compete with friends</CardDescription>
        </CardHeader>
        <CardContent>
          {debugMessage && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                {debugMessage}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
              <TabsTrigger value="signup" data-testid="tab-signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                    data-testid="input-login-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    data-testid="input-login-password"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                  data-testid="button-login"
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    required
                    data-testid="input-signup-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                    data-testid="input-signup-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Confirm Password</Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    placeholder="••••••••"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    required
                    data-testid="input-signup-confirm"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                  data-testid="button-signup"
                >
                  {loading ? 'Creating account...' : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
