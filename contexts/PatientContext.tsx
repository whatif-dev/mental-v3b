"use client"

import React, { createContext, useState, useContext, ReactNode } from 'react';

type Patient = {
  id: string;
  full_name: string;
} | null;

type PatientContextType = {
  selectedPatient: Patient;
  setSelectedPatient: (patient: Patient) => void;
};

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: ReactNode }) {
  const [selectedPatient, setSelectedPatient] = useState<Patient>(null);

  return (
    <PatientContext.Provider value={{ selectedPatient, setSelectedPatient }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
}