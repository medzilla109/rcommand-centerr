import { useState } from 'react';
import type { Incident } from '@/types/mci';
import { calcLevel } from '@/types/mci';

interface ActivateViewProps {
  incident: Incident | null;
  onActivate: (heavy: number, minor: number, timeMode: 'in' | 'out') => void;
  onDeactivate: () => void;
}

export function ActivateView({ incident, onActivate, onDeactivate }: ActivateViewProps) {
  const [heavy, setHeavy] = useState(0);
  const [minor, setMinor] = useState(0);
  const [timeMode, setTimeMode] = useState<'in' | 'out'>('in');
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  const weightedScore = (heavy * 3) + (minor * 1);
  const level = calcLevel(weightedScore);

  const levelDescriptions: Record<number, string> = {
    1: 'ER + พยาบาล Ward / IPD / ICU',
    2: 'ระดมทีมเสริม + เปิดห้องผ่าตัด + เรียกแพทย์เสริม',
    3: 'ประกาศวิกฤตสูงสุด + ประสาน 1669 + Diversion',
  };

  if (incident?.isActive) {
    return (
      <div className="p-4 space-y-4">
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-center">
          <p className="text-destructive font-bold text-lg">🚨 ราชเวช 191 — ACTIVE</p>
          <p className="font-mono text-2xl font-bold text-foreground mt-2">LEVEL {incident.level}</p>
          <p className="text-sm text-muted-foreground mt-1">W.Score: <span className="font-mono">{incident.weightedScore}</span></p>
          <p className="text-xs text-muted-foreground mt-1">{incident.timeMode === 'in' ? 'ในเวลาราชการ' : 'นอกเวลาราชการ'}</p>
        </div>

        {!showConfirmClose ? (
          <button
            onClick={() => setShowConfirmClose(true)}
            className="w-full touch-target rounded-lg bg-surface-2 border border-border text-muted-foreground font-semibold py-4 text-base"
          >
            ปิดรหัส ราชเวช 191
          </button>
        ) : (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 space-y-3">
            <p className="text-destructive font-semibold text-center">ยืนยันการปิดรหัส?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmClose(false)}
                className="flex-1 touch-target rounded-lg bg-surface-2 border border-border text-muted-foreground font-semibold py-3"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => { onDeactivate(); setShowConfirmClose(false); }}
                className="flex-1 touch-target rounded-lg bg-destructive text-destructive-foreground font-bold py-3"
              >
                ยืนยัน ปิดรหัส
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5">
      <div className="text-center">
        <h2 className="text-lg font-bold text-foreground">Incident Activation</h2>
        <p className="text-xs text-muted-foreground mt-1">Weighted Score Calculator — ตาม SOP ราชเวช 191</p>
      </div>

      {/* Time Mode Toggle */}
      <div className="grid grid-cols-2 gap-2">
        {(['in', 'out'] as const).map(mode => (
          <button
            key={mode}
            onClick={() => setTimeMode(mode)}
            className={`touch-target rounded-lg py-3 font-semibold text-sm transition-colors ${
              timeMode === mode 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-surface-2 text-muted-foreground border border-border'
            }`}
          >
            {mode === 'in' ? 'ในเวลาราชการ' : 'นอกเวลาราชการ'}
          </button>
        ))}
      </div>

      {/* Heavy patients counter */}
      <div className="bg-surface rounded-lg border border-border p-4">
        <p className="text-sm text-destructive font-semibold mb-3">🔴 ผู้ป่วยหนัก (แดง+เหลือง) × 3 คะแนน/คน</p>
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => setHeavy(Math.max(0, heavy - 1))} className="touch-target w-14 h-14 rounded-lg bg-surface-2 border border-border text-foreground text-2xl font-bold">−</button>
          <span className="font-mono text-4xl font-bold text-foreground w-16 text-center">{heavy}</span>
          <button onClick={() => setHeavy(heavy + 1)} className="touch-target w-14 h-14 rounded-lg bg-surface-2 border border-border text-foreground text-2xl font-bold">+</button>
        </div>
      </div>

      {/* Minor patients counter */}
      <div className="bg-surface rounded-lg border border-border p-4">
        <p className="text-sm text-status-safe font-semibold mb-3">🟢 ผู้ป่วยเล็กน้อย (เขียว) × 1 คะแนน/คน</p>
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => setMinor(Math.max(0, minor - 1))} className="touch-target w-14 h-14 rounded-lg bg-surface-2 border border-border text-foreground text-2xl font-bold">−</button>
          <span className="font-mono text-4xl font-bold text-foreground w-16 text-center">{minor}</span>
          <button onClick={() => setMinor(minor + 1)} className="touch-target w-14 h-14 rounded-lg bg-surface-2 border border-border text-foreground text-2xl font-bold">+</button>
        </div>
      </div>

      {/* Level Display */}
      <div className={`rounded-lg p-4 text-center border-2 ${
        level === 3 ? 'bg-destructive/15 border-destructive' :
        level === 2 ? 'bg-status-warning/15 border-status-warning' :
        'bg-primary/15 border-primary'
      }`}>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Weighted Score</p>
        <p className="font-mono text-5xl font-bold text-foreground mt-1">{weightedScore}</p>
        <p className={`font-mono text-2xl font-bold mt-2 ${
          level === 3 ? 'text-destructive' : level === 2 ? 'text-status-warning' : 'text-primary'
        }`}>
          LEVEL {level}
        </p>
        <p className="text-xs text-muted-foreground mt-2">{levelDescriptions[level]}</p>
      </div>

      {/* Activate Button */}
      <button
        onClick={() => {
          if (weightedScore > 0) onActivate(heavy, minor, timeMode);
        }}
        disabled={weightedScore === 0}
        className={`w-full rounded-lg py-4 text-lg font-bold transition-colors ${
          weightedScore > 0
            ? 'bg-destructive text-destructive-foreground active:brightness-110'
            : 'bg-surface-2 text-muted-foreground cursor-not-allowed'
        }`}
        style={{ minHeight: 56 }}
      >
        🚨 เปิดรหัส ราชเวช 191 — Level {level}
      </button>
    </div>
  );
}
