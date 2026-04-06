export type TriageColor = 'red' | 'yellow' | 'green' | 'black' | 'white';

export type TriageLevel = {
  color: TriageColor;
  label: string;
  labelTh: string;
  description: string;
};

export const TRIAGE_LEVELS: TriageLevel[] = [
  { color: 'red', label: 'Immediate', labelTh: 'วิกฤต', description: 'Life-threatening' },
  { color: 'yellow', label: 'Delayed', labelTh: 'เร่งด่วน', description: 'Serious but stable' },
  { color: 'green', label: 'Minor', labelTh: 'เล็กน้อย', description: 'Walking wounded' },
  { color: 'black', label: 'Deceased', labelTh: 'เสียชีวิต', description: 'Non-salvageable' },
];

export interface Patient {
  id: string;
  arrivalNumber: number;
  triage: TriageColor;
  chiefComplaint: string;
  age?: number;
  gender?: 'M' | 'F' | 'U';
  location?: string;
  status: 'waiting' | 'treating' | 'transferred' | 'discharged' | 'deceased';
  createdAt: number;
  updatedAt: number;
  notes?: string;
}

export interface Incident {
  id: string;
  name: string;
  location: string;
  startedAt: number;
  isActive: boolean;
  commanderName?: string;
}

export type TabId = 'dashboard' | 'triage' | 'patients' | 'resources';
