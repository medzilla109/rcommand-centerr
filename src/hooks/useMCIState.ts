import { useState, useCallback } from 'react';
import type { Patient, Incident, TriageColor } from '@/types/mci';

const generateId = () => Math.random().toString(36).substring(2, 9).toUpperCase();

export function useMCIState() {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);

  const startIncident = useCallback((name: string, location: string, commanderName?: string) => {
    setIncident({
      id: generateId(),
      name,
      location,
      startedAt: Date.now(),
      isActive: true,
      commanderName,
    });
    setPatients([]);
  }, []);

  const endIncident = useCallback(() => {
    setIncident(prev => prev ? { ...prev, isActive: false } : null);
  }, []);

  const addPatient = useCallback((triage: TriageColor, chiefComplaint: string, age?: number, gender?: 'M' | 'F' | 'U') => {
    setPatients(prev => {
      const newPatient: Patient = {
        id: generateId(),
        arrivalNumber: prev.length + 1,
        triage,
        chiefComplaint,
        age,
        gender,
        status: triage === 'black' ? 'deceased' : 'waiting',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      return [...prev, newPatient];
    });
  }, []);

  const updatePatientTriage = useCallback((patientId: string, triage: TriageColor) => {
    setPatients(prev => prev.map(p =>
      p.id === patientId ? { ...p, triage, updatedAt: Date.now() } : p
    ));
  }, []);

  const updatePatientStatus = useCallback((patientId: string, status: Patient['status']) => {
    setPatients(prev => prev.map(p =>
      p.id === patientId ? { ...p, status, updatedAt: Date.now() } : p
    ));
  }, []);

  const triageCounts = {
    red: patients.filter(p => p.triage === 'red').length,
    yellow: patients.filter(p => p.triage === 'yellow').length,
    green: patients.filter(p => p.triage === 'green').length,
    black: patients.filter(p => p.triage === 'black').length,
    white: patients.filter(p => p.triage === 'white').length,
    total: patients.length,
  };

  return {
    incident,
    patients,
    triageCounts,
    startIncident,
    endIncident,
    addPatient,
    updatePatientTriage,
    updatePatientStatus,
  };
}
