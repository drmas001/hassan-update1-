import { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { PatientCondition, DischargeStatus } from '../types/patient';

export function usePatientStatus(patientId: string) {
  const [isUpdating, setIsUpdating] = useState(false);

  const updatePatientCondition = async (newCondition: PatientCondition) => {
    setIsUpdating(true);
    try {
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('name, condition')
        .eq('id', patientId)
        .single();

      if (patientError) throw patientError;

      // Don't update if condition hasn't changed
      if (patient.condition === newCondition) {
        return;
      }

      const { error: updateError } = await supabase
        .from('patients')
        .update({
          condition: newCondition,
          updated_at: new Date().toISOString()
        })
        .eq('id', patientId);

      if (updateError) throw updateError;

      toast.success(`Condition updated to ${newCondition}`);
    } catch (error) {
      console.error('Error updating patient condition:', error);
      toast.error('Failed to update patient condition');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateDischargeStatus = async (newStatus: DischargeStatus) => {
    setIsUpdating(true);
    try {
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('name, discharge_status')
        .eq('id', patientId)
        .single();

      if (patientError) throw patientError;

      // Don't update if status hasn't changed
      if (patient.discharge_status === newStatus) {
        return;
      }

      const { error: updateError } = await supabase
        .from('patients')
        .update({
          discharge_status: newStatus,
          discharge_date: newStatus === 'Discharged' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', patientId);

      if (updateError) throw updateError;

      toast.success(`Discharge status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating discharge status:', error);
      toast.error('Failed to update discharge status');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updatePatientCondition,
    updateDischargeStatus,
    isUpdating
  };
}