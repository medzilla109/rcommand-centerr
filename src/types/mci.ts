export type TriageColor = 'red' | 'yellow' | 'green' | 'black';

export type PatientStatus = 
  | 'waiting' 
  | 'treating' 
  | 'stable' 
  | 'deteriorate' 
  | 'admitted' 
  | 'referred' 
  | 'discharged' 
  | 'expectant' 
  | 'monitor'
  | 'deceased';

export const TRIAGE_LEVELS = [
  { color: 'red' as TriageColor, label: 'แดง', labelEn: 'Immediate', description: 'วิกฤต — ต้องรักษาใน 4 นาที', icon: '🔴' },
  { color: 'yellow' as TriageColor, label: 'เหลือง', labelEn: 'Delayed', description: 'เร่งด่วน — ภายใน 1 ชม.', icon: '🟡' },
  { color: 'green' as TriageColor, label: 'เขียว', labelEn: 'Minor', description: 'ไม่เร่งด่วน — เดินได้', icon: '🟢' },
  { color: 'black' as TriageColor, label: 'ดำ', labelEn: 'Deceased/Expectant', description: 'เสียชีวิต / Expectant', icon: '⚫' },
];

export const CHIEF_COMPLAINTS = [
  'Polytrauma', 'Head Injury', 'Chest Injury',
  'Abdo Injury', 'Fracture', 'Burn',
  'Shock', 'Resp Fail', 'Laceration',
];

export const ZONE_CAPACITY: Record<TriageColor, number> = {
  red: 6,
  yellow: 10,
  green: 20,
  black: 999,
};

export const ZONE_NAMES: Record<TriageColor, string> = {
  red: 'Red Zone — Resus + หัตถการ',
  yellow: 'Yellow Zone — ER สังเกต',
  green: 'Green Zone — OPD F1',
  black: 'Black Zone — หน้าห้องเก็บศพ',
};

export interface StatusHistoryEntry {
  status: PatientStatus;
  timestamp: number;
  note?: string;
}

export interface Patient {
  id: string;
  arrivalNumber: number;
  triage: TriageColor;
  zone: TriageColor;
  name: string;
  isUnknown: boolean;
  gender: 'male' | 'female' | 'unknown';
  age: string;
  triageTag?: string;
  chiefComplaint: string[];
  status: PatientStatus;
  statusHistory: StatusHistoryEntry[];
  createdAt: number;
  updatedAt: number;
}

export interface Incident {
  id: string;
  name: string;
  level: 1 | 2 | 3;
  weightedScore: number;
  heavyCount: number;
  minorCount: number;
  timeMode: 'in' | 'out';
  isActive: boolean;
  startedAt: number;
  closedAt?: number;
}

export interface TimelineEvent {
  id: string;
  timestamp: number;
  type: 'triage' | 'status' | 'incident' | 'report' | 'referral';
  icon: string;
  message: string;
}

export type TabId = 'dashboard' | 'activate' | 'triage' | 'patients' | 'referral';

// Level calculation per SOP
export function calcLevel(weightedScore: number): 1 | 2 | 3 {
  if (weightedScore > 20) return 3;  // > 15 heavy equivalent
  if (weightedScore > 10) return 2;  // 11-20
  return 1;                          // 6-10
}

export function generateUnknownId(
  gender: 'male' | 'female' | 'unknown',
  color: TriageColor,
  existingPatients: Patient[]
): string {
  const genderTh = gender === 'male' ? 'ชาย' : gender === 'female' ? 'หญิง' : 'ไม่ระบุ';
  const colorTh: Record<TriageColor, string> = { red: 'แดง', yellow: 'เหลือง', green: 'เขียว', black: 'ดำ' };
  const count = existingPatients.filter(p => p.isUnknown && p.triage === color && p.gender === gender).length + 1;
  return `${genderTh}-${colorTh[color]}-${count}`;
}

// Valid status transitions per SOP
export const VALID_TRANSITIONS: Record<PatientStatus, PatientStatus[]> = {
  waiting: ['treating', 'admitted', 'referred', 'discharged', 'deteriorate'],
  treating: ['stable', 'admitted', 'referred', 'discharged', 'deteriorate'],
  stable: ['admitted', 'referred', 'discharged', 'deteriorate'],
  deteriorate: ['treating', 'admitted', 'expectant', 'deceased'],
  admitted: [],
  referred: [],
  discharged: [],
  expectant: ['monitor', 'deceased', 'treating'],
  monitor: ['deceased', 'treating'],
  deceased: [],
};
