import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/stores/authStore";

import AuthPage from "@/pages/auth-page";
import OnboardingPage from "@/pages/onboarding-page";
import ChatsPage from "@/pages/chats-page";
import ChatDetailPage from "@/pages/chat-detail-page";
import SearchPage from "@/pages/search-page";
import RankingsPage from "@/pages/rankings-page";
import ProfilePage from "@/pages/profile-page";
import BottomNav from "@/components/layout/bottom-nav";
import TopHeader from "@/components/layout/top-header";

function AuthenticatedLayout() {
  const [location] = useLocation();

  // Pages that should not show navigation
  const hideNav = location.startsWith('/chat/') || location === '/search';

  console.log('AuthenticatedLayout rendering, location:', location);

  return (
    <div className="flex flex-col h-screen">
      {!hideNav && <TopHeader />}
      <Switch>
        <Route path="/" component={ChatsPage} />
        <Route path="/chat/:id" component={ChatDetailPage} />
        <Route path="/search" component={SearchPage} />
        <Route path="/rankings" component={RankingsPage} />
        <Route path="/profile" component={ProfilePage} />
      </Switch>
      {!hideNav && <BottomNav />}
    </div>
  );
}

function Router() {
  const { user, profile, loading, initialized, initialize } = useAuthStore();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    console.log('Router: Initializing auth store');
    initialize();
  }, [initialize]);

  useEffect(() => {
    console.log('Router state:', {
      initialized,
      loading,
      hasUser: !!user,
      hasProfile: !!profile,
      location
    });

    if (initialized && !loading) {
      if (!user) {
        console.log('No user, redirecting to /auth');
        setLocation('/auth');
      } else if (user && !profile) {
        console.log('User exists but no profile, redirecting to /onboarding');
        setLocation('/onboarding');
      } else if (user && profile) {
        console.log('User and profile loaded:', { email: user.email, name: profile.name });
      }
    }
  }, [user, profile, loading, initialized, setLocation, location]);

  if (!initialized || loading) {
    console.log('Router: Loading...', { initialized, loading });
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  console.log('Router: Rendering routes', { hasUser: !!user, hasProfile: !!profile });

  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/:rest*">
        {user && profile ? <AuthenticatedLayout /> : <AuthPage />}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
