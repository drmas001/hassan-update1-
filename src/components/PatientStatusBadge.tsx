import React from 'react';
import { Activity, AlertCircle, HeartPulse } from 'lucide-react';
import type { PatientCondition } from '../types/patient';

interface PatientStatusBadgeProps {
  condition: PatientCondition;
  onConditionChange?: (newCondition: PatientCondition) => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
}

export function PatientStatusBadge({ 
  condition, 
  onConditionChange,
  isLoading = false,
  disabled = false
}: PatientStatusBadgeProps) {
  const handleClick = async (newCondition: PatientCondition) => {
    if (onConditionChange && !isLoading && !disabled && condition !== newCondition) {
      try {
        await onConditionChange(newCondition);
      } catch (error) {
        console.error('Error updating condition:', error);
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
        onClick={() => handleClick('Active')}
        disabled={isDisabled || condition === 'Active'}
        className={`${buttonClass} ${
          condition === 'Active'
            ? `bg-green-100 text-green-800 ${activeClass}`
            : `bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700 ${inactiveClass}`
        } ${isDisabled ? disabledClass : ''}`}
      >
        <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
        Active
      </button>

      <button
        onClick={() => handleClick('Critical')}
        disabled={isDisabled || condition === 'Critical'}
        className={`${buttonClass} ${
          condition === 'Critical'
            ? `bg-red-100 text-red-800 ${activeClass}`
            : `bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700 ${inactiveClass}`
        } ${isDisabled ? disabledClass : ''}`}
      >
        <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
        Critical
      </button>

      <button
        onClick={() => handleClick('DNR')}
        disabled={isDisabled || condition === 'DNR'}
        className={`${buttonClass} ${
          condition === 'DNR'
            ? `bg-purple-100 text-purple-800 ${activeClass}`
            : `bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-700 ${inactiveClass}`
        } ${isDisabled ? disabledClass : ''}`}
      >
        <HeartPulse className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
        DNR
      </button>
    </div>
  );
}