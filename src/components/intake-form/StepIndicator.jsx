import React from 'react';
import { CheckCircle } from 'lucide-react';

const StepIndicator = ({ currentStep, totalSteps = 5, className = '' }) => {
  const steps = [
    { number: 1, label: 'פרטים אישיים' },
    { number: 2, label: 'פרטי חיית המחמד' },
    { number: 3, label: 'היסטוריה רפואית' },
    { number: 4, label: 'מידע על הביקור' },
    { number: 5, label: 'סיכום ואישור' }
  ];

  return (
    <div className={`w-full ${className}`} dir="rtl">
      <div className="flex justify-between items-center mb-6">
        {steps.map((step, index) => {
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;
          
          return (
            <div key={step.number} className="flex flex-col items-center flex-1">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold mb-2 transition-all duration-300
                  ${isActive 
                    ? 'bg-blue-500 text-white shadow-lg ring-4 ring-blue-200' 
                    : isCompleted 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }
                `}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`
                  text-xs font-medium text-center leading-tight px-1
                  ${isActive 
                    ? 'text-blue-600' 
                    : isCompleted 
                      ? 'text-green-600' 
                      : 'text-gray-500'
                  }
                `}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Progress Bar - תיקון כיווניות RTL */}
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
          <div
            className="bg-gradient-to-l from-blue-500 to-teal-500 h-2 rounded-full transition-all duration-500 ease-in-out"
            style={{
              width: `${(currentStep / totalSteps) * 100}%`,
              marginRight: 'auto',
              marginLeft: `${100 - (currentStep / totalSteps) * 100}%`
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>התחלה</span>
          <span>סיום</span>
        </div>
      </div>
    </div>
  );
};

export default StepIndicator;