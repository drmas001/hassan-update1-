import React from 'react';
import { Clock, LogOut, AlertTriangle } from 'lucide-react';
import type { DischargeStatus } from '../types/patient';

interface DischargeStatusBadgeProps {
  status: DischargeStatus;
  onStatusChange?: (newStatus: DischargeStatus) => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
}

export function DischargeStatusBadge({
  status,
  onStatusChange,
  isLoading = false,
  disabled = false
}: DischargeStatusBadgeProps) {
  const handleClick = async (newStatus: DischargeStatus) => {
    if (onStatusChange && !isLoading && !disabled && status !== newStatus) {
      try {
        await onStatusChange(newStatus);
      } catch (error) {
        console.error('Error updating discharge status:', error);
      }
    }
  };

  const buttonClass = "inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors duration-200";
  const activeClass = "cursor-default";
  const inactiveClass = "cursor-pointer hover:bg-opacity-80";
  const disabledClass = "opacity-50 cursor-not-allowed";

  const isDisabled = isLoading || disabled;

  return (
    <div className="flex space-x-2">
      <button
        onClick={() => handleClick('Admitted')}
        disabled={isDisabled || status === 'Admitted'}
        className={`${buttonClass} ${
          status === 'Admitted'
            ? `bg-blue-100 text-blue-800 ${activeClass}`
            : `bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700 ${inactiveClass}`
        } ${isDisabled ? disabledClass : ''}`}
      >
        <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
        Admitted
      </button>

      <button
        onClick={() => handleClick('Pending')}
        disabled={isDisabled || status === 'Pending'}
        className={`${buttonClass} ${
          status === 'Pending'
            ? `bg-yellow-100 text-yellow-800 ${activeClass}`
            : `bg-gray-100 text-gray-600 hover:bg-yellow-50 hover:text-yellow-700 ${inactiveClass}`
        } ${isDisabled ? disabledClass : ''}`}
      >
        <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
        Pending
      </button>

      <button
        onClick={() => handleClick('Discharged')}
        disabled={isDisabled || status === 'Discharged'}
        className={`${buttonClass} ${
          status === 'Discharged'
            ? `bg-gray-100 text-gray-800 ${activeClass}`
            : `bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700 ${inactiveClass}`
        } ${isDisabled ? disabledClass : ''}`}
      >
        <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
        Discharged
      </button>
    </div>
  );
}