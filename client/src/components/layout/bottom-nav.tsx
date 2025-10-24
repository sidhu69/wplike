import { Link, useLocation } from 'wouter';
import { MessageCircle, TrendingUp, User } from 'lucide-react';

export default function BottomNav() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { path: '/', icon: MessageCircle, label: 'Chats', testId: 'nav-chats' },
    { path: '/rankings', icon: TrendingUp, label: 'Rankings', testId: 'nav-rankings' },
    { path: '/profile', icon: User, label: 'Profile', testId: 'nav-profile' },
  ];

  return (
    <nav className="h-16 border-t bg-background flex items-center justify-around px-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);
        
        return (
          <Link key={item.path} href={item.path}>
            <button
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-md transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              data-testid={item.testId}
            >
              <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 2} />
              <span className={`text-xs ${active ? 'font-medium' : ''}`}>{item.label}</span>
            </button>
          </Link>
        );
      })}
    </nav>
  );
}
