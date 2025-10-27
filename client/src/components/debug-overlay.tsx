import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export function DebugOverlay() {
  const { user, profile, loading, initialized } = useAuthStore();
  const [logs, setLogs] = useState<string[]>([]);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const addLog = (msg: string) => {
      setLogs(prev => [...prev.slice(-10), `${new Date().toLocaleTimeString()}: ${msg}`]);
    };

    addLog(`Initialized: ${initialized}, Loading: ${loading}`);
    addLog(`User: ${user?.email || 'none'}`);
    addLog(`Profile: ${profile?.name || 'none'}`);

    // Check session
    supabase.auth.getSession().then(({ data: { session } }) => {
      addLog(`Session: ${session?.user?.email || 'none'}`);
    });

    // Check database profile
    if (user) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            addLog(`DB Error: ${error.message}`);
          } else {
            addLog(`DB Profile: ${data?.name || 'none'}`);
          }
        });
    }
  }, [user, profile, loading, initialized]);

  if (!show) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 bg-black/90 text-white text-xs p-2 z-50 max-h-48 overflow-auto"
      onClick={() => setShow(false)}
    >
      <div className="font-bold mb-1">DEBUG (tap to hide)</div>
      <div className="space-y-1">
        <div>Init: {initialized ? '✓' : '✗'} | Loading: {loading ? '✓' : '✗'}</div>
        <div>User: {user?.email || 'NONE'}</div>
        <div>Profile: {profile?.name || 'NONE'}</div>
        <div>Location: {window.location.pathname}</div>
      </div>
      <div className="mt-2 border-t border-white/20 pt-2">
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    </div>
  );
}
