import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function TopHeader() {
  const [location, setLocation] = useLocation();

  const getTitle = () => {
    if (location === '/') return 'Chats';
    if (location === '/rankings') return 'Rankings';
    if (location === '/profile') return 'Profile';
    return 'ChatApp';
  };

  const showSearch = location === '/';

  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-4">
      <h1 className="text-xl font-semibold">{getTitle()}</h1>
      
      {showSearch && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation('/search')}
          data-testid="button-search"
        >
          <Search className="w-5 h-5" />
        </Button>
      )}
    </header>
  );
}
