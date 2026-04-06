import { useState } from 'react';
import type { Patient, TriageColor } from '@/types/mci';
import { TRIAGE_LEVELS, CHIEF_COMPLAINTS } from '@/types/mci';

interface TriageFormProps {
  patients: Patient[];
  onSubmit: (data: {
    triage: TriageColor;
    isUnknown: boolean;
    name: string;
    gender: 'male' | 'female' | 'unknown';
    age: string;
    triageTag?: string;
    chiefComplaint: string;
  }) => void;
}

const triageStyles: Record<TriageColor, string> = {
  red: 'bg-triage-red text-white ring-triage-red',
  yellow: 'bg-triage-yellow text-background ring-triage-yellow',
  green: 'bg-triage-green text-white ring-triage-green',
  black: 'bg-triage-black text-white border border-muted-foreground/30',
};

export function TriageForm({ patients, onSubmit }: TriageFormProps) {
  const [triage, setTriage] = useState<TriageColor | null>(null);
  const [isUnknown, setIsUnknown] = useState(false);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'unknown'>('unknown');
  const [age, setAge] = useState('');
  const [triageTag, setTriageTag] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [customComplaint, setCustomComplaint] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const resetForm = () => {
    setTriage(null);
    setIsUnknown(false);
    setName('');
    setGender('unknown');
    setAge('');
    setTriageTag('');
    setChiefComplaint('');
    setCustomComplaint('');
    setSubmitted(false);
  };

  const handleSubmit = () => {
    if (!triage) return;
    const complaint = chiefComplaint || customComplaint;
    if (!complaint) return;
    
    onSubmit({
      triage,
      isUnknown,
      name: isUnknown ? '' : name,
      gender,
      age,
      triageTag: triageTag || undefined,
      chiefComplaint: complaint,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="text-center">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-lg font-bold text-foreground">บันทึกสำเร็จ</p>
          <p className="text-sm text-muted-foreground mt-1">PT-{String(patients.length).padStart(3, '0')}</p>
        </div>
        <button
          onClick={resetForm}
          className="w-full max-w-xs touch-target rounded-lg bg-primary text-primary-foreground font-bold py-4 text-base"
        >
          + บันทึกผู้ป่วยรายถัดไป
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-8">
      {/* Triage Color — Big 2×2 Grid */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Triage Color</label>
        <div className="grid grid-cols-2 gap-3">
          {TRIAGE_LEVELS.map(level => (
            <button
              key={level.color}
              onClick={() => setTriage(level.color)}
              className={`triage-card text-base font-bold rounded-lg px-2 py-3 ${triageStyles[level.color]} ${
                triage === level.color ? 'triage-card-selected ring-2 ring-offset-2 ring-offset-background scale-[1.02]' : 'opacity-80'
              }`}
              style={{ minHeight: 72 }}
            >
              <span className="text-2xl mb-1">{level.icon}</span>
              <span className="text-sm font-bold">{level.label}</span>
              <span className="text-[10px] opacity-80 mt-0.5">{level.labelEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Unknown Patient Toggle */}
      <div className="bg-surface rounded-lg border border-border p-3">
        <button
          onClick={() => setIsUnknown(!isUnknown)}
          className="w-full flex items-center justify-between touch-target"
        >
          <span className="text-sm font-semibold text-foreground">ระบุตัวตนไม่ได้ (Unknown Patient)</span>
          <span className={`w-12 h-7 rounded-full transition-colors flex items-center px-1 ${isUnknown ? 'bg-primary justify-end' : 'bg-surface-2 justify-start'}`}>
            <span className="w-5 h-5 rounded-full bg-foreground" />
          </span>
        </button>
        {isUnknown && triage && (
          <p className="text-xs text-primary mt-2 font-mono">
            → Auto ID: {gender === 'male' ? 'ชาย' : gender === 'female' ? 'หญิง' : 'ไม่ระบุ'}-{
              {red:'แดง',yellow:'เหลือง',green:'เขียว',black:'ดำ'}[triage]
            }-{patients.filter(p => p.isUnknown && p.triage === triage && p.gender === gender).length + 1}
          </p>
        )}
      </div>

      {/* Triage Tag */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">เลข Triage Tag</label>
        <input
          type="text"
          value={triageTag}
          onChange={e => setTriageTag(e.target.value)}
          placeholder="เลขป้าย Triage Tag"
          className="w-full touch-target bg-surface border border-border rounded-lg px-3 py-3 text-foreground font-mono placeholder:text-muted-foreground/50 text-base"
        />
      </div>

      {/* Name (if not unknown) */}
      {!isUnknown && (
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">ชื่อ-นามสกุล</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="ชื่อ-นามสกุล (ถ้าทราบ)"
            className="w-full touch-target bg-surface border border-border rounded-lg px-3 py-3 text-foreground placeholder:text-muted-foreground/50 text-base"
          />
        </div>
      )}

      {/* Gender + Age Row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">เพศ</label>
          <div className="flex gap-2">
            {([['male', 'ชาย'], ['female', 'หญิง']] as const).map(([val, lbl]) => (
              <button
                key={val}
                onClick={() => setGender(val)}
                className={`flex-1 touch-target rounded-lg py-3 text-sm font-semibold transition-colors ${
                  gender === val ? 'bg-primary text-primary-foreground' : 'bg-surface border border-border text-muted-foreground'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">อายุ (ประมาณ)</label>
          <input
            type="text"
            value={age}
            onChange={e => setAge(e.target.value)}
            placeholder="ปี"
            className="w-full touch-target bg-surface border border-border rounded-lg px-3 py-3 text-foreground font-mono placeholder:text-muted-foreground/50 text-base"
          />
        </div>
      </div>

      {/* Chief Complaint — Quick Grid */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Chief Complaint</label>
        <div className="grid grid-cols-3 gap-2">
          {CHIEF_COMPLAINTS.map(c => (
            <button
              key={c}
              onClick={() => { setChiefComplaint(c); setCustomComplaint(''); }}
              className={`touch-target rounded-lg py-2 text-xs font-bold text-center ${
                {red:'bg-triage-red text-white',yellow:'bg-triage-yellow text-background',green:'bg-triage-green text-white',black:'bg-triage-black text-white border border-muted-foreground/30'}[triage]
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={customComplaint}
          onChange={e => { setCustomComplaint(e.target.value); setChiefComplaint(''); }}
          placeholder="หรือพิมพ์เอง..."
          className="w-full touch-target bg-surface border border-border rounded-lg px-3 py-3 text-foreground placeholder:text-muted-foreground/50 text-base mt-2"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!triage || (!chiefComplaint && !customComplaint)}
        className={`w-full rounded-lg py-4 text-lg font-bold transition-colors ${
          triage && (chiefComplaint || customComplaint)
            ? `${triageStyles[triage!]} active:brightness-110`
            : 'bg-surface-2 text-muted-foreground cursor-not-allowed'
        }`}
        style={{ minHeight: 56 }}
      >
        {triage ? `${TRIAGE_LEVELS.find(l => l.color === triage)?.icon} บันทึกผู้ป่วยสี${TRIAGE_LEVELS.find(l => l.color === triage)?.label}` : 'เลือกสี Triage ก่อน'}
      </button>
    </div>
  );
}
