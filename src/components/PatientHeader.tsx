import React from 'react';
import { User, Hash, Bed, Calendar } from 'lucide-react';
import { PatientStatusBadge } from './PatientStatusBadge';
import { usePatientStatus } from '../hooks/usePatientStatus';
import type { Patient } from '../types/patient';

interface PatientHeaderProps {
  patient: Patient;
}

export function PatientHeader({ patient }: PatientHeaderProps) {
  const { updatePatientStatus, isUpdating } = usePatientStatus(patient.id);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus !== patient.status) {
      await updatePatientStatus(newStatus);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center">
          <User className="h-8 sm:h-12 w-8 sm:w-12 text-blue-500" />
          <div className="ml-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{patient.name}</h2>
              <span className="text-sm text-gray-500">
                <Hash className="h-4 w-4 inline" /> {patient.mrn}
              </span>
            </div>
            <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-500">
              <span>{patient.age} years</span>
              <span className="hidden sm:inline">•</span>
              <span>{patient.gender}</span>
              <span className="hidden sm:inline">•</span>
              <span>
                <Bed className="h-4 w-4 inline mr-1" />
                Bed {patient.bed_number}
              </span>
              <span className="hidden sm:inline">•</span>
              <span>
                <Calendar className="h-4 w-4 inline mr-1" />
                Admitted {new Date(patient.admission_date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <PatientStatusBadge 
            status={patient.status} 
            onStatusChange={handleStatusChange}
            showDropdown={true}
            isLoading={isUpdating}
          />
        </div>
      </div>
    </div>
  );
}