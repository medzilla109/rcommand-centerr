import { useElapsedTime } from '@/hooks/useElapsedTime';
import type { Incident } from '@/types/mci';

interface TopBarProps {
  incident: Incident | null;
}

export function TopBar({ incident }: TopBarProps) {
  const elapsed = useElapsedTime(incident?.isActive ? incident.startedAt : null);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[52px] bg-surface border-b border-border flex items-center px-3 gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center flex-shrink-0">
          <span className="font-mono text-xs font-bold text-primary-foreground">191</span>
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-foreground truncate">RJV 191</h1>
          <p className="text-[10px] text-muted-foreground truncate leading-tight">Rajavej Hospital CNX</p>
        </div>
      </div>

      <div className="flex-1" />

      {incident ? (
        <div className="flex items-center gap-3">
          {incident.isActive && (
            <span className="pulse-active inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-status-danger/20 text-status-danger text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-status-danger" />
              ACTIVE
            </span>
          )}
          <span className="font-mono text-sm font-semibold text-foreground tabular-nums">{elapsed}</span>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">STANDBY</span>
      )}
    </header>
  );
}
