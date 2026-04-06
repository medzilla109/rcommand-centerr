import { useState } from 'react';

interface Referral {
  id: string;
  patientId: string;
  hospital: string;
  patientCount: number;
  triageColor: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: number;
  note?: string;
}

export function ReferralView() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [hospital, setHospital] = useState('');
  const [patientId, setPatientId] = useState('');
  const [note, setNote] = useState('');

  const addReferral = () => {
    if (!hospital) return;
    setReferrals(prev => [...prev, {
      id: Math.random().toString(36).substring(2, 8).toUpperCase(),
      patientId,
      hospital,
      patientCount: 1,
      triageColor: 'red',
      status: 'pending',
      timestamp: Date.now(),
      note: note || undefined,
    }]);
    setHospital('');
    setPatientId('');
    setNote('');
    setShowForm(false);
  };

  const updateStatus = (id: string, status: Referral['status']) => {
    setReferrals(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-triage-yellow/20 text-triage-yellow',
    accepted: 'bg-triage-green/20 text-triage-green',
    rejected: 'bg-destructive/20 text-destructive',
  };

  return (
    <div className="p-4 space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">External Referral Log</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="touch-target px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold"
        >
          + เพิ่ม
        </button>
      </div>

      {showForm && (
        <div className="bg-surface rounded-lg border border-border p-4 space-y-3">
          <input
            type="text"
            value={hospital}
            onChange={e => setHospital(e.target.value)}
            placeholder="ชื่อ รพ. ปลายทาง"
            className="w-full touch-target bg-surface-2 border border-border rounded-lg px-3 py-3 text-foreground placeholder:text-muted-foreground/50"
          />
          <input
            type="text"
            value={patientId}
            onChange={e => setPatientId(e.target.value)}
            placeholder="Patient ID (เช่น PT-001)"
            className="w-full touch-target bg-surface-2 border border-border rounded-lg px-3 py-3 text-foreground font-mono placeholder:text-muted-foreground/50"
          />
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="หมายเหตุ"
            className="w-full touch-target bg-surface-2 border border-border rounded-lg px-3 py-3 text-foreground placeholder:text-muted-foreground/50"
          />
          <button onClick={addReferral} className="w-full touch-target rounded-lg bg-primary text-primary-foreground font-bold py-3">
            บันทึกส่งต่อ
          </button>
        </div>
      )}

      {referrals.length === 0 ? (
        <p className="text-center text-muted-foreground py-8 text-sm">ยังไม่มีรายการส่งต่อ</p>
      ) : (
        referrals.map(ref => (
          <div key={ref.id} className="bg-surface rounded-lg border border-border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-foreground">{ref.patientId || '—'}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusColors[ref.status]}`}>
                {ref.status === 'pending' ? 'รอตอบรับ' : ref.status === 'accepted' ? 'ตอบรับแล้ว' : 'ปฏิเสธ'}
              </span>
            </div>
            <p className="text-sm text-foreground">→ {ref.hospital}</p>
            {ref.note && <p className="text-xs text-muted-foreground">{ref.note}</p>}
            <p className="font-mono text-[10px] text-muted-foreground">
              {new Date(ref.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
            </p>
            {ref.status === 'pending' && (
              <div className="flex gap-2">
                <button onClick={() => updateStatus(ref.id, 'accepted')} className="flex-1 touch-target py-2 rounded bg-triage-green/20 text-triage-green text-xs font-bold">ตอบรับ</button>
                <button onClick={() => updateStatus(ref.id, 'rejected')} className="flex-1 touch-target py-2 rounded bg-destructive/20 text-destructive text-xs font-bold">ปฏิเสธ</button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
