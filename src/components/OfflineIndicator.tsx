import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-500/90 border border-amber-400/30 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-amber-950 shadow-lg">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Offline Mode — Cached app manifests and packages ready.</span>
    </div>
  );
};
