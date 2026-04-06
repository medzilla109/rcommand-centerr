import type { Incident } from '@/types/mci';
import { useElapsedTime } from '@/hooks/useElapsedTime';

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
          <p className="text-[10px] text-muted-foreground truncate leading-tight">ราชเวช เชียงใหม่</p>
        </div>
      </div>

      <div className="flex-1" />

      {incident?.isActive ? (
        <div className="flex items-center gap-2">
          <span className="pulse-active inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-destructive/20 text-destructive text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
            LV{incident.level}
          </span>
          <span className="font-mono text-sm font-bold text-foreground tabular-nums tracking-wider">{elapsed}</span>
        </div>
      ) : incident ? (
        <span className="text-xs font-semibold text-status-safe">CLOSED</span>
      ) : (
        <span className="text-xs text-muted-foreground font-semibold tracking-wider">STANDBY</span>
      )}
    </header>
  );
}
