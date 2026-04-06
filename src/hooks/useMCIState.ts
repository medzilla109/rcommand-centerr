import { useState, useCallback, useMemo } from 'react';
import type { Patient, Incident, TriageColor, PatientStatus, TimelineEvent } from '@/types/mci';
import { calcLevel, generateUnknownId } from '@/types/mci';

const genId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export function useMCIState() {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [nextPatientNum, setNextPatientNum] = useState(1);

  const addTimelineEvent = useCallback((type: TimelineEvent['type'], icon: string, message: string) => {
    setTimeline(prev => [{
      id: genId(),
      timestamp: Date.now(),
      type,
      icon,
      message,
    }, ...prev].slice(0, 100));
  }, []);

  const activateIncident = useCallback((heavyCount: number, minorCount: number, timeMode: 'in' | 'out') => {
    const weightedScore = (heavyCount * 3) + (minorCount * 1);
    const level = calcLevel(weightedScore);
    const inc: Incident = {
      id: genId(),
      name: `ราชเวช 191`,
      level,
      weightedScore,
      heavyCount,
      minorCount,
      timeMode,
      isActive: true,
      startedAt: Date.now(),
    };
    setIncident(inc);
    setPatients([]);
    setNextPatientNum(1);
    setTimeline([]);
    addTimelineEvent('incident', '🚨', `เปิดรหัส ราชเวช 191 — Level ${level} (W.Score: ${weightedScore})`);
  }, [addTimelineEvent]);

  const deactivateIncident = useCallback(() => {
    setIncident(prev => prev ? { ...prev, isActive: false, closedAt: Date.now() } : null);
    addTimelineEvent('incident', '🔒', 'ปิดรหัส ราชเวช 191');
  }, [addTimelineEvent]);

  const addPatient = useCallback((data: {
    triage: TriageColor;
    isUnknown: boolean;
    name: string;
    gender: 'male' | 'female' | 'unknown';
    age: string;
    triageTag?: string;
    chiefComplaint: string[];
  }) => {
    const num = nextPatientNum;
    setNextPatientNum(n => n + 1);
    
    const patientName = data.isUnknown 
      ? generateUnknownId(data.gender, data.triage, patients) 
      : data.name;

    const patientId = `PT-${String(num).padStart(3, '0')}`;
    const now = Date.now();
    
    const newPatient: Patient = {
      id: patientId,
      arrivalNumber: num,
      triage: data.triage,
      zone: data.triage,
      name: patientName,
      isUnknown: data.isUnknown,
      gender: data.gender,
      age: data.age,
      triageTag: data.triageTag,
      chiefComplaint: data.chiefComplaint,
      status: data.triage === 'black' ? 'expectant' : 'waiting',
      statusHistory: [{ status: data.triage === 'black' ? 'expectant' : 'waiting', timestamp: now }],
      createdAt: now,
      updatedAt: now,
    };
    
    setPatients(prev => [...prev, newPatient]);
    
    const colorIcon: Record<TriageColor, string> = { red: '🔴', yellow: '🟡', green: '🟢', black: '⚫' };
    addTimelineEvent('triage', colorIcon[data.triage], `${patientId} ${patientName} → ${data.chiefComplaint.join(', ')}`);
    
    return newPatient;
  }, [nextPatientNum, patients, addTimelineEvent]);

  const updatePatientStatus = useCallback((patientId: string, newStatus: PatientStatus, note?: string) => {
    setPatients(prev => prev.map(p => {
      if (p.id !== patientId) return p;
      const now = Date.now();
      return {
        ...p,
        status: newStatus,
        updatedAt: now,
        statusHistory: [...p.statusHistory, { status: newStatus, timestamp: now, note }],
      };
    }));
    addTimelineEvent('status', '📋', `${patientId} → ${newStatus}${note ? ` (${note})` : ''}`);
  }, [addTimelineEvent]);

  const retriagePatient = useCallback((patientId: string, newColor: TriageColor) => {
    setPatients(prev => prev.map(p => {
      if (p.id !== patientId) return p;
      const now = Date.now();
      const newStatus: PatientStatus = newColor === 'black' ? 'expectant' : 'waiting';
      return {
        ...p,
        triage: newColor,
        zone: newColor,
        status: newStatus,
        updatedAt: now,
        statusHistory: [...p.statusHistory, { status: newStatus, timestamp: now, note: `Re-triage → ${newColor}` }],
      };
    }));
    const colorIcon: Record<TriageColor, string> = { red: '🔴', yellow: '🟡', green: '🟢', black: '⚫' };
    addTimelineEvent('triage', colorIcon[newColor], `${patientId} Re-triage → ${newColor}`);
  }, [addTimelineEvent]);

  const triageCounts = useMemo(() => ({
    red: patients.filter(p => p.zone === 'red').length,
    yellow: patients.filter(p => p.zone === 'yellow').length,
    green: patients.filter(p => p.zone === 'green').length,
    black: patients.filter(p => p.zone === 'black').length,
    total: patients.length,
    admitted: patients.filter(p => p.status === 'admitted').length,
    referred: patients.filter(p => p.status === 'referred').length,
    discharged: patients.filter(p => p.status === 'discharged').length,
    waiting: patients.filter(p => ['waiting', 'treating', 'stable', 'deteriorate', 'expectant', 'monitor'].includes(p.status)).length,
    deceased: patients.filter(p => p.status === 'deceased').length,
  }), [patients]);

  return {
    incident,
    patients,
    timeline,
    triageCounts,
    activateIncident,
    deactivateIncident,
    addPatient,
    updatePatientStatus,
    retriagePatient,
  };
}
