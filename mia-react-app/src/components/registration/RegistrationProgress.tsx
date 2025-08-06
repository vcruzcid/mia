import { Button } from '@/components/ui/button';

// Using simple checkmark instead of @heroicons for now

interface RegistrationProgressProps {
  currentStep: 1 | 2 | 3;
  completedSteps: Set<1 | 2 | 3>;
  stepTitles: Record<1 | 2 | 3, string>;
  progressPercentage: number;
  onStepClick: (step: 1 | 2 | 3) => void;
}

export function RegistrationProgress({
  currentStep,
  completedSteps,
  stepTitles,
  progressPercentage,
  onStepClick,
}: RegistrationProgressProps) {
  const steps = [1, 2, 3] as const;

  const getStepStatus = (step: 1 | 2 | 3) => {
    if (completedSteps.has(step)) return 'completed';
    if (step === currentStep) return 'current';
    if (step < currentStep) return 'completed';
    return 'upcoming';
  };

  const getStepClasses = (step: 1 | 2 | 3) => {
    const status = getStepStatus(step);
    const baseClasses = 'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200';
    
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-primary-600 text-white cursor-pointer hover:bg-primary-700`;
      case 'current':
        return `${baseClasses} bg-primary-600 text-white ring-2 ring-primary-200 ring-offset-2`;
      case 'upcoming':
        return `${baseClasses} bg-gray-200 text-gray-600 cursor-not-allowed`;
      default:
        return baseClasses;
    }
  };

  const getConnectorClasses = (step: 1 | 2) => {
    const isCompleted = completedSteps.has(step) || currentStep > step;
    return `flex-1 h-0.5 mx-4 transition-all duration-300 ${
      isCompleted ? 'bg-primary-600' : 'bg-gray-200'
    }`;
  };

  return (
    <div className="mb-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-medium text-gray-500 mb-2">
          <span>Progreso</span>
          <span>{Math.round(progressPercentage)}% completado</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const status = getStepStatus(step);
          const isClickable = completedSteps.has(step) || step <= currentStep;

          return (
            <div key={step} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <Button
                  onClick={() => isClickable && onStepClick(step)}
                  disabled={!isClickable}
                  variant="ghost"
                  size="icon"
                  className={`${getStepClasses(step)} ${
                    !isClickable ? 'cursor-not-allowed' : ''
                  } relative group w-8 h-8`}
                  aria-label={`Ir al paso ${step}: ${stepTitles[step]}`}
                >
                  {status === 'completed' ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span>{step}</span>
                  )}

                  {/* Tooltip */}
                  {isClickable && (
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                      {stepTitles[step]}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  )}
                </Button>

                {/* Step Title (visible on larger screens) */}
                <div className="mt-2 text-center hidden sm:block">
                  <p className={`text-xs font-medium ${
                    status === 'completed' || status === 'current' 
                      ? 'text-primary-600' 
                      : 'text-gray-500'
                  }`}>
                    {stepTitles[step]}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={getConnectorClasses(step as 1 | 2)} />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Step Titles */}
      <div className="mt-4 text-center sm:hidden">
        <p className="text-sm font-medium text-primary-600">
          {stepTitles[currentStep]}
        </p>
        <p className="text-xs text-gray-500">
          Paso {currentStep} de {steps.length}
        </p>
      </div>

      {/* Step Navigation Hints */}
      <div className="mt-6 text-center text-xs text-gray-500">
        <p>
          {currentStep < 3 
            ? 'Completa este paso para continuar' 
            : 'Último paso - ¡ya casi terminas!'
          }
        </p>
        {completedSteps.size > 0 && (
          <p className="mt-1">
            💡 Puedes hacer clic en los pasos completados para revisarlos
          </p>
        )}
      </div>
    </div>
  );
}

// Alternative simplified version without @heroicons dependency
export function RegistrationProgressSimple({
  currentStep,
  completedSteps,
  stepTitles,
  progressPercentage,
  onStepClick,
}: RegistrationProgressProps) {
  const steps = [1, 2, 3] as const;

  const getStepStatus = (step: 1 | 2 | 3) => {
    if (completedSteps.has(step)) return 'completed';
    if (step === currentStep) return 'current';
    return 'upcoming';
  };

  const getStepClasses = (step: 1 | 2 | 3) => {
    const status = getStepStatus(step);
    const baseClasses = 'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200';
    
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-500 text-white cursor-pointer hover:bg-green-600`;
      case 'current':
        return `${baseClasses} bg-primary-600 text-white ring-2 ring-primary-200 ring-offset-2`;
      case 'upcoming':
        return `${baseClasses} bg-gray-300 text-gray-600`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className="mb-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-medium text-gray-500 mb-2">
          <span>Progreso del registro</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-2.5 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const status = getStepStatus(step);
          const isClickable = completedSteps.has(step) || step <= currentStep;

          return (
            <div key={step} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <Button
                  onClick={() => isClickable && onStepClick(step)}
                  disabled={!isClickable}
                  variant="ghost"
                  size="icon"
                  className={`${getStepClasses(step)} w-8 h-8`}
                  title={stepTitles[step]}
                >
                  {status === 'completed' ? '✓' : step}
                </Button>

                {/* Step Title */}
                <div className="mt-2 text-center">
                  <p className={`text-xs font-medium ${
                    status === 'completed' || status === 'current' 
                      ? 'text-primary-600' 
                      : 'text-gray-500'
                  }`}>
                    {stepTitles[step]}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${
                  completedSteps.has(step) || currentStep > step
                    ? 'bg-primary-500' 
                    : 'bg-gray-300'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}