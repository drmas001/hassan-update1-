import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { Database } from '../types/supabase';

type Patient = Database['public']['Tables']['patients']['Row'];

export function usePatient(patientId: string) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchPatient() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from('patients')
          .select(`
            *,
            attending_physician:users!patients_attending_physician_id_fkey(
              name,
              employee_code
            )
          `)
          .eq('id', patientId)
          .single();

        if (supabaseError) throw supabaseError;
        if (!data) throw new Error('Patient not found');

        if (mounted) {
          setPatient(data);
        }
      } catch (err) {
        console.error('Error fetching patient:', err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch patient'));
          toast.error('Failed to load patient data');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (patientId) {
      fetchPatient();

      // Subscribe to real-time changes
      const channel = supabase
        .channel(`patient_${patientId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'patients',
            filter: `id=eq.${patientId}`
          },
          async (payload) => {
            if (!mounted) return;

            if (payload.eventType === 'UPDATE') {
              const { data } = await supabase
                .from('patients')
                .select(`
                  *,
                  attending_physician:users!patients_attending_physician_id_fkey(
                    name,
                    employee_code
                  )
                `)
                .eq('id', patientId)
                .single();

              if (data) {
                setPatient(data);
              }
            }
          }
        )
        .subscribe();

      return () => {
        mounted = false;
        supabase.removeChannel(channel);
      };
    }
  }, [patientId]);

  return { patient, loading, error };
}