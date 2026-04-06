import type { Incident, TimelineEvent } from '@/types/mci';
import { ZONE_CAPACITY, ZONE_NAMES, type TriageColor } from '@/types/mci';
import { useElapsedTime } from '@/hooks/useElapsedTime';

interface DashboardViewProps {
  incident: Incident | null;
  triageCounts: {
    red: number; yellow: number; green: number; black: number;
    total: number; admitted: number; referred: number; discharged: number;
    waiting: number; deceased: number;
  };
  timeline: TimelineEvent[];
}

const zoneColors: Record<TriageColor, { bg: string; text: string; bar: string }> = {
  red: { bg: 'bg-triage-red/10', text: 'text-triage-red', bar: 'bg-triage-red' },
  yellow: { bg: 'bg-triage-yellow/10', text: 'text-triage-yellow', bar: 'bg-triage-yellow' },
  green: { bg: 'bg-triage-green/10', text: 'text-triage-green', bar: 'bg-triage-green' },
  black: { bg: 'bg-muted/20', text: 'text-muted-foreground', bar: 'bg-muted-foreground' },
};

function CapacityBar({ zone, count }: { zone: TriageColor; count: number }) {
  const max = ZONE_CAPACITY[zone];
  const pct = max === 999 ? 0 : Math.min((count / max) * 100, 100);
  const colors = zoneColors[zone];
  const isOverflow = pct >= 80;

  return (
    <div className={`${colors.bg} rounded-lg p-3 border border-border`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-semibold ${colors.text}`}>{ZONE_NAMES[zone]}</span>
        <span className={`font-mono text-lg font-bold ${colors.text}`}>{count}</span>
      </div>
      {max !== 999 && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isOverflow ? 'bg-destructive' : colors.bar}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className={`font-mono text-xs ${isOverflow ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
            {Math.round(pct)}%
          </span>
        </div>
      )}
      {max !== 999 && (
        <p className="text-[10px] text-muted-foreground mt-1 font-mono">{count}/{max} ราย</p>
      )}
    </div>
  );
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}

export function DashboardView({ incident, triageCounts, timeline }: DashboardViewProps) {
  const elapsed = useElapsedTime(incident?.isActive ? incident.startedAt : null);

  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="w-20 h-20 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mb-4">
          <span className="font-mono text-2xl font-bold text-muted-foreground">191</span>
        </div>
        <h2 className="text-xl font-bold text-foreground">RJV 191 — STANDBY</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          ระบบพร้อมใช้งาน — ไปที่ tab "Activate" เพื่อเปิดรหัส ราชเวช 191
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-8">
      {/* Incident Header */}
      {incident.isActive && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-destructive font-bold text-sm">🚨 ราชเวช 191 ACTIVE</p>
            <p className="text-xs text-muted-foreground">Level {incident.level} · W.Score: <span className="font-mono">{incident.weightedScore}</span></p>
          </div>
          <span className="font-mono text-xl font-bold text-foreground tabular-nums">{elapsed}</span>
        </div>
      )}

      {/* Zone Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(['red', 'yellow', 'green', 'black'] as TriageColor[]).map(zone => (
          <CapacityBar key={zone} zone={zone} count={triageCounts[zone]} />
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-5 gap-2">
        {[
          { label: 'รวม', value: triageCounts.total, color: 'text-foreground' },
          { label: 'Admit', value: triageCounts.admitted, color: 'text-primary' },
          { label: 'Refer', value: triageCounts.referred, color: 'text-status-warning' },
          { label: 'D/C', value: triageCounts.discharged, color: 'text-status-safe' },
          { label: 'รอ', value: triageCounts.waiting, color: 'text-triage-yellow' },
        ].map(stat => (
          <div key={stat.label} className="bg-surface rounded-lg border border-border p-2 text-center">
            <p className={`font-mono text-xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Timeline</h3>
        <div className="bg-surface rounded-lg border border-border divide-y divide-border max-h-[300px] overflow-y-auto">
          {timeline.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4 text-center">ยังไม่มีกิจกรรม</p>
          ) : (
            timeline.map(event => (
              <div key={event.id} className="flex items-start gap-2 p-3">
                <span className="font-mono text-xs text-muted-foreground whitespace-nowrap mt-0.5">{formatTime(event.timestamp)}</span>
                <span className="text-sm">{event.icon}</span>
                <p className="text-sm text-foreground flex-1 min-w-0">{event.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
