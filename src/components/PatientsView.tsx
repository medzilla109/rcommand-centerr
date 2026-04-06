import { useState } from 'react';
import type { Patient, TriageColor, PatientStatus } from '@/types/mci';
import { VALID_TRANSITIONS, TRIAGE_LEVELS } from '@/types/mci';

interface PatientsViewProps {
  patients: Patient[];
  onUpdateStatus: (id: string, status: PatientStatus, note?: string) => void;
  onRetriage: (id: string, color: TriageColor) => void;
}

const statusLabels: Record<PatientStatus, { label: string; color: string }> = {
  waiting: { label: 'รอรักษา', color: 'bg-triage-yellow/20 text-triage-yellow' },
  treating: { label: 'กำลังรักษา', color: 'bg-triage-yellow/20 text-triage-yellow' },
  stable: { label: 'Stable', color: 'bg-triage-green/20 text-triage-green' },
  deteriorate: { label: 'Deteriorating', color: 'bg-destructive/20 text-destructive' },
  admitted: { label: 'Admit', color: 'bg-primary/20 text-primary' },
  referred: { label: 'Refer', color: 'bg-status-warning/20 text-status-warning' },
  discharged: { label: 'D/C', color: 'bg-triage-green/20 text-triage-green' },
  expectant: { label: 'Expectant', color: 'bg-muted text-muted-foreground' },
  monitor: { label: 'Monitor', color: 'bg-muted text-muted-foreground' },
  deceased: { label: 'Deceased', color: 'bg-muted text-muted-foreground' },
};

const zoneFilterColors: Record<TriageColor | 'all', string> = {
  all: 'bg-primary text-primary-foreground',
  red: 'bg-triage-red text-white',
  yellow: 'bg-triage-yellow text-background',
  green: 'bg-triage-green text-white',
  black: 'bg-triage-black text-white border border-muted-foreground/30',
};

function ElapsedBadge({ since }: { since: number }) {
  const mins = Math.floor((Date.now() - since) / 60000);
  return <span className="font-mono text-[10px] text-muted-foreground">{mins} นาที</span>;
}

export function PatientsView({ patients, onUpdateStatus, onRetriage }: PatientsViewProps) {
  const [filter, setFilter] = useState<TriageColor | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showRetriage, setShowRetriage] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string; status: PatientStatus } | null>(null);

  const filtered = filter === 'all' ? patients : patients.filter(p => p.zone === filter);
  const sorted = [...filtered].sort((a, b) => {
    const priority: Record<TriageColor, number> = { red: 0, yellow: 1, green: 2, black: 3 };
    return priority[a.zone] - priority[b.zone] || b.createdAt - a.createdAt;
  });

  const dangerStatuses: PatientStatus[] = ['deceased', 'deteriorate'];

  const handleStatusChange = (id: string, status: PatientStatus) => {
    if (dangerStatuses.includes(status) || status === 'admitted' || status === 'referred') {
      setConfirmAction({ id, status });
    } else {
      onUpdateStatus(id, status);
      setExpandedId(null);
    }
  };

  return (
    <div className="p-4 space-y-3 pb-8">
      {/* Zone Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['all', 'red', 'yellow', 'green', 'black'] as const).map(z => (
          <button
            key={z}
            onClick={() => setFilter(z)}
            className={`touch-target px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              filter === z ? zoneFilterColors[z] : 'bg-surface border border-border text-muted-foreground'
            }`}
          >
            {z === 'all' ? `ทั้งหมด (${patients.length})` : `${TRIAGE_LEVELS.find(l => l.color === z)?.icon} ${patients.filter(p => p.zone === z).length}`}
          </button>
        ))}
      </div>

      {/* Patient Cards */}
      {sorted.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">ยังไม่มีผู้ป่วย</p>
      ) : (
        sorted.map(patient => {
          const isExpanded = expandedId === patient.id;
          const statusInfo = statusLabels[patient.status];
          const transitions = VALID_TRANSITIONS[patient.status];
          const isFinal = transitions.length === 0;
          
          return (
            <div key={patient.id} className={`bg-surface rounded-lg border border-border overflow-hidden ${isFinal ? 'opacity-60' : ''}`}>
              <button
                onClick={() => setExpandedId(isExpanded ? null : patient.id)}
                className="w-full p-3 flex items-start gap-3 text-left touch-target"
              >
                <div className={`w-2 h-full min-h-[48px] rounded-full flex-shrink-0 ${
                  {red:'bg-triage-red',yellow:'bg-triage-yellow',green:'bg-triage-green',black:'bg-muted-foreground'}[patient.zone]
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold text-foreground">{patient.id}</span>
                    {patient.triageTag && <span className="font-mono text-xs text-muted-foreground">Tag: {patient.triageTag}</span>}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusInfo.color}`}>{statusInfo.label}</span>
                  </div>
                  <p className="text-sm text-foreground mt-1 truncate">{patient.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    <span>{patient.gender === 'male' ? 'ชาย' : patient.gender === 'female' ? 'หญิง' : '?'}</span>
                    {patient.age && <span>· อายุ ~{patient.age} ปี</span>}
                    <span>· {patient.chiefComplaint}</span>
                  </div>
                  <ElapsedBadge since={patient.createdAt} />
                </div>
              </button>

              {isExpanded && !isFinal && (
                <div className="border-t border-border p-3 space-y-3">
                  {/* Status Actions */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">เปลี่ยนสถานะ:</p>
                    <div className="flex flex-wrap gap-2">
                      {transitions.map(s => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(patient.id, s)}
                          className={`touch-target px-3 py-2 rounded-lg text-xs font-semibold ${statusLabels[s].color} border border-border`}
                        >
                          {statusLabels[s].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Re-triage */}
                  <div>
                    <button
                      onClick={() => setShowRetriage(showRetriage === patient.id ? null : patient.id)}
                      className="text-xs text-primary underline"
                    >
                      Re-triage สี
                    </button>
                    {showRetriage === patient.id && (
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {TRIAGE_LEVELS.filter(l => l.color !== patient.zone).map(l => (
                          <button
                            key={l.color}
                            onClick={() => { onRetriage(patient.id, l.color); setShowRetriage(null); setExpandedId(null); }}
                            className={`touch-target rounded-lg py-2 text-xs font-bold text-center ${
                              {red:'bg-triage-red text-white',yellow:'bg-triage-yellow text-background',green:'bg-triage-green text-white',black:'bg-triage-black text-white border border-muted-foreground/30'}[l.color]
                            }`}
                          >
                            {l.icon} {l.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl p-6 max-w-sm w-full space-y-4">
            <p className="text-foreground font-bold text-center">
              ยืนยัน: {confirmAction.id} → {statusLabels[confirmAction.status].label}?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 touch-target rounded-lg bg-surface-2 border border-border text-muted-foreground font-semibold py-3"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => { onUpdateStatus(confirmAction.id, confirmAction.status); setConfirmAction(null); setExpandedId(null); }}
                className="flex-1 touch-target rounded-lg bg-destructive text-destructive-foreground font-bold py-3"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
