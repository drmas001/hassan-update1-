export type PatientCondition = 'Active' | 'Critical' | 'DNR';
export type DischargeStatus = 'Admitted' | 'Pending' | 'Discharged';

export interface Patient {
  id: string;
  mrn: string;
  name: string;
  age: number;
  gender: string;
  diagnosis: string;
  bed_number: string;
  condition: PatientCondition;
  discharge_status: DischargeStatus;
  admission_date: string;
  attending_physician_id: string;
  history: string;
  examination: string;
  notes: string;
  daily_notes?: DailyNote[];
  updated_at: string;
  discharge_date?: string;
  visible: boolean;
}

export interface DailyNote {
  id: string;
  patient_id: string;
  note_date: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}