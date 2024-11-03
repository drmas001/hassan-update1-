import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Activity,
  Heart,
  Wind,
  Thermometer,
  Clock,
  User,
  FileText,
  Pill,
  TestTube,
  Hash,
  Bed,
  Stethoscope,
  ClipboardList,
  Plus,
  LogOut,
} from 'lucide-react';
import { usePatient } from '../hooks/usePatient';
import { useVitals } from '../hooks/useVitals';
import { useMedications } from '../hooks/useMedications';
import { useLabResults } from '../hooks/useLabResults';
import { useProcedures } from '../hooks/useProcedures';
import { useDailyNotes } from '../hooks/useDailyNotes';
import { usePatientStatus } from '../hooks/usePatientStatus';
import { PatientStatusBadge } from './PatientStatusBadge';
import { DischargeForm } from './DischargeForm';
import { LoadingSpinner } from './LoadingSpinner';
import { VitalsChart } from './VitalsChart';
import { MedicationList } from './MedicationList';
import { LabResults } from './LabResults';
import { ProcedureList } from './ProcedureList';
import { DailyNotes } from './DailyNotes';
import { AddVitalsForm } from './AddVitalsForm';
import { AddMedicationForm } from './AddMedicationForm';
import { AddLabResultForm } from './AddLabResultForm';
import { AddProcedureForm } from './AddProcedureForm';
import { AddDailyNoteForm } from './AddDailyNoteForm';

export function PatientDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showDischargeForm, setShowDischargeForm] = useState(false);
  const [showAddVitalsForm, setShowAddVitalsForm] = useState(false);
  const [showAddMedicationForm, setShowAddMedicationForm] = useState(false);
  const [showAddLabResultForm, setShowAddLabResultForm] = useState(false);
  const [showAddProcedureForm, setShowAddProcedureForm] = useState(false);
  const [showAddNoteForm, setShowAddNoteForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'vitals' | 'medications' | 'labs' | 'procedures' | 'notes'>('overview');

  const { patient, loading } = usePatient(id || '');
  const { vitals, loading: vitalsLoading } = useVitals(id || '');
  const { medications, loading: medsLoading, updateMedicationStatus } = useMedications(id || '');
  const { results: labResults, loading: labsLoading } = useLabResults(id || '');
  const { procedures, loading: proceduresLoading } = useProcedures(id || '');
  const { notes, loading: notesLoading, refreshNotes } = useDailyNotes(id || '');
  const { updatePatientStatus, isUpdating } = usePatientStatus(id || '');

  const handleDischargeComplete = () => {
    setShowDischargeForm(false);
    navigate('/dashboard');
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updatePatientStatus(newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!patient) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-700">Patient not found</p>
        </div>
      </div>
    );
  }

  const isActiveAdmission = patient.status !== 'Discharged';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Patient Header */}
      <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6 mb-6">
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
                  <Clock className="h-4 w-4 inline mr-1" />
                  Admitted {new Date(patient.admission_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <PatientStatusBadge 
              status={patient.status} 
              onStatusChange={handleStatusChange}
              isLoading={isUpdating}
            />
            {isActiveAdmission && (
              <button
                onClick={() => setShowDischargeForm(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Discharge Patient
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {isActiveAdmission && (
        <div className="mb-6 flex flex-wrap gap-4">
          <button
            onClick={() => setShowAddVitalsForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Activity className="h-4 w-4 mr-2" />
            Record Vitals
          </button>
          <button
            onClick={() => setShowAddMedicationForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Pill className="h-4 w-4 mr-2" />
            Add Medication
          </button>
          <button
            onClick={() => setShowAddLabResultForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <TestTube className="h-4 w-4 mr-2" />
            Add Lab Result
          </button>
          <button
            onClick={() => setShowAddProcedureForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Stethoscope className="h-4 w-4 mr-2" />
            Record Procedure
          </button>
          <button
            onClick={() => setShowAddNoteForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: FileText },
            { key: 'vitals', label: 'Vitals', icon: Activity },
            { key: 'medications', label: 'Medications', icon: Pill },
            { key: 'labs', label: 'Lab Results', icon: TestTube },
            { key: 'procedures', label: 'Procedures', icon: Stethoscope },
            { key: 'notes', label: 'Notes', icon: ClipboardList },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`${
                activeTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Diagnosis</h3>
              <p className="text-gray-600">{patient.diagnosis}</p>
            </div>

            {patient.history && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">History</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{patient.history}</p>
              </div>
            )}

            {patient.examination && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Physical Examination</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{patient.examination}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'vitals' && !vitalsLoading && (
          <div className="space-y-6">
            {vitals.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <Heart className="h-8 w-8 text-red-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Heart Rate</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {vitals[0].heart_rate} <span className="text-sm text-gray-500">bpm</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <Wind className="h-8 w-8 text-blue-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Oxygen Saturation</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {vitals[0].oxygen_saturation}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <Thermometer className="h-8 w-8 text-orange-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Temperature</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {vitals[0].temperature}°C
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <Activity className="h-8 w-8 text-purple-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Blood Pressure</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {vitals[0].blood_pressure}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Heart Rate History</h3>
                    <VitalsChart
                      data={vitals}
                      metric="heart_rate"
                      color="#ef4444"
                      label="Heart Rate"
                      unit="bpm"
                    />
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Oxygen Saturation History</h3>
                    <VitalsChart
                      data={vitals}
                      metric="oxygen_saturation"
                      color="#3b82f6"
                      label="SpO2"
                      unit="%"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
                <p className="text-gray-500">No vitals recorded yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'medications' && !medsLoading && (
          <MedicationList
            medications={medications}
            onUpdateStatus={updateMedicationStatus}
          />
        )}

        {activeTab === 'labs' && !labsLoading && (
          <LabResults results={labResults} />
        )}

        {activeTab === 'procedures' && !proceduresLoading && (
          <ProcedureList procedures={procedures} />
        )}

        {activeTab === 'notes' && !notesLoading && (
          <DailyNotes
            patientId={patient.id}
            notes={notes}
            onNoteAdded={refreshNotes}
          />
        )}
      </div>

      {/* Modal Forms */}
      {showDischargeForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-4xl bg-white rounded-lg">
            <DischargeForm
              patient={patient}
              onDischarge={handleDischargeComplete}
            />
          </div>
        </div>
      )}

      {showAddVitalsForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg">
            <AddVitalsForm
              patientId={patient.id}
              onClose={() => setShowAddVitalsForm(false)}
            />
          </div>
        </div>
      )}

      {showAddMedicationForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg">
            <AddMedicationForm
              patientId={patient.id}
              onClose={() => setShowAddMedicationForm(false)}
            />
          </div>
        </div>
      )}

      {showAddLabResultForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg">
            <AddLabResultForm
              patientId={patient.id}
              onClose={() => setShowAddLabResultForm(false)}
            />
          </div>
        </div>
      )}

      {showAddProcedureForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg">
            <AddProcedureForm
              patientId={patient.id}
              onClose={() => setShowAddProcedureForm(false)}
            />
          </div>
        </div>
      )}

      {showAddNoteForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg">
            <AddDailyNoteForm
              patientId={patient.id}
              onClose={() => setShowAddNoteForm(false)}
              onSuccess={() => {
                setShowAddNoteForm(false);
                refreshNotes();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}