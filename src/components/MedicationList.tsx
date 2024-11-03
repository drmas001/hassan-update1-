import React from 'react';
import { Pill, Clock, AlertCircle } from 'lucide-react';
import type { Database } from '../types/supabase';

type Medication = Database['public']['Tables']['medications']['Row'] & {
  prescriber?: {
    name: string;
  };
};

interface MedicationListProps {
  medications: Medication[];
  onUpdateStatus: (medicationId: string, newStatus: Medication['status']) => Promise<void>;
}

export function MedicationList({ medications, onUpdateStatus }: MedicationListProps) {
  const getStatusColor = (status: Medication['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Discontinued':
        return 'bg-red-100 text-red-800';
      case 'Completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const sortedMedications = [...medications].sort((a, b) => {
    // Sort by status (Active first, then others)
    if (a.status === 'Active' && b.status !== 'Active') return -1;
    if (a.status !== 'Active' && b.status === 'Active') return 1;
    // Then sort by start date (newest first)
    return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
  });

  if (sortedMedications.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
        <p className="text-gray-500">No medications recorded</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedMedications.map((medication) => (
        <div
          key={medication.id}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Pill className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <h4 className="text-lg font-medium text-gray-900">{medication.name}</h4>
                <p className="text-sm text-gray-600">
                  {medication.dosage} - {medication.route}
                </p>
                <p className="text-sm text-gray-600">
                  Frequency: {medication.frequency}
                </p>
                {medication.prescriber && (
                  <p className="text-sm text-gray-600 mt-1">
                    Prescribed by: {medication.prescriber.name}
                  </p>
                )}
                {medication.notes && (
                  <div className="mt-2 flex items-start space-x-1">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <p className="text-sm text-gray-600">{medication.notes}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                  medication.status
                )}`}
              >
                {medication.status}
              </span>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>
                  Started:{' '}
                  {new Date(medication.start_date).toLocaleDateString()}
                </span>
              </div>
              {medication.end_date && (
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>
                    Ended:{' '}
                    {new Date(medication.end_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
          {medication.status === 'Active' && (
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => onUpdateStatus(medication.id, 'Completed')}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Mark Complete
              </button>
              <button
                onClick={() => onUpdateStatus(medication.id, 'Discontinued')}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Discontinue
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}