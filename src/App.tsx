import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { CalendarGrid, MonthNavigation } from './components/calendar';
import { Header, Container } from './components/layout';
import { WizardContainer, PatternPicker, ParentSetup, HolidaySelector } from './components/wizard';
import { WizardProvider, useWizard } from './context';
import type { PatternType } from './types';
import type { SplitType } from './data/patterns';
import type { ParentSetupData, HolidaySelection } from './components/wizard';

/** Static wizard steps configuration - defined outside component to avoid recreation on each render */
const WIZARD_STEPS = [
  { title: 'Choose Schedule', description: 'Select a custody schedule pattern' },
  { title: 'Parent Setup', description: 'Configure parent information' },
  { title: 'Holiday Settings', description: 'Set holiday custody rules' },
];

/**
 * Wizard modal overlay component.
 * Shows the wizard as a modal dialog over the main content.
 */
function WizardModal({
  isOpen,
  onClose,
  onFinish,
}: {
  isOpen: boolean;
  onClose: () => void;
  onFinish: () => void;
}) {
  const { state, dispatch } = useWizard();

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handlePatternSelect = (pattern: PatternType, split: SplitType) => {
    dispatch({ type: 'SET_PATTERN', payload: { pattern, split } });
  };

  const handleParentSetupChange = (parentSetup: ParentSetupData) => {
    dispatch({ type: 'SET_PARENTS', payload: parentSetup });
  };

  const handleHolidaySelectionsChange = (holidaySelections: HolidaySelection[]) => {
    dispatch({ type: 'SET_HOLIDAYS', payload: holidaySelections });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-auto mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Close wizard"
        >
          <X className="h-4 w-4 text-gray-600" />
        </button>

        {/* Wizard content */}
        <WizardContainer
          steps={WIZARD_STEPS}
          onFinish={onFinish}
          onCancel={onClose}
        >
          {(currentStep) => {
            if (currentStep === 0) {
              return (
                <PatternPicker
                  selectedPattern={state.pattern}
                  onPatternSelect={handlePatternSelect}
                />
              );
            }
            if (currentStep === 1) {
              return (
                <ParentSetup
                  data={state.parentSetup}
                  onChange={handleParentSetupChange}
                />
              );
            }
            return (
              <HolidaySelector
                selections={state.holidaySelections}
                onSelectionsChange={handleHolidaySelectionsChange}
                parentAName={state.parentSetup.parentAName || 'Parent A'}
                parentBName={state.parentSetup.parentBName || 'Parent B'}
              />
            );
          }}
        </WizardContainer>
      </div>
    </div>
  );
}

/**
 * Main application content component.
 * Uses WizardContext for wizard state management.
 */
function AppContent() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [showWizard, setShowWizard] = useState(true);
  const { state: wizardState, toAppState, reset } = useWizard();

  const handleExportClick = () => {
    // Placeholder for future export functionality
    console.log('Export clicked');
  };

  const handleNewScheduleClick = useCallback(() => {
    reset();
    setShowWizard(true);
  }, [reset]);

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const handleWizardFinish = () => {
    setShowWizard(false);
    const appState = toAppState();
    console.log('Wizard finished with AppState:', appState);
  };

  const handleWizardClose = () => {
    setShowWizard(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header at top */}
      <Header
        onExportClick={handleExportClick}
        onNewScheduleClick={handleNewScheduleClick}
      />

      {/* Wizard modal overlay */}
      <WizardModal
        isOpen={showWizard}
        onClose={handleWizardClose}
        onFinish={handleWizardFinish}
      />

      {/* Main content area */}
      <Container>
        {/* Current schedule info */}
        {wizardState.pattern && wizardState.split && (
          <div className="mb-6 rounded-xl bg-white p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                  {wizardState.split}
                </span>
                <span className="font-medium text-gray-700">
                  {wizardState.pattern.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              </div>
              {wizardState.parentSetup.parentAName && wizardState.parentSetup.parentBName && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{wizardState.parentSetup.parentAName}</span>
                  <span>•</span>
                  <span>{wizardState.parentSetup.parentBName}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Responsive layout: stacks on mobile, side-by-side on desktop (prep for stats panel) */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          {/* Calendar section - takes 2/3 on desktop */}
          <div className="lg:col-span-2">
            {/* Month Navigation integrated into calendar card */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
              <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <MonthNavigation
                  currentMonth={currentMonth}
                  onPreviousMonth={handlePreviousMonth}
                  onNextMonth={handleNextMonth}
                />
              </div>

              {/* Calendar Grid fills main area */}
              <div className="p-6">
                <CalendarGrid currentMonth={currentMonth} hideTitle />
              </div>
            </div>
          </div>

          {/* Stats panel placeholder - takes 1/3 on desktop */}
          <div className="sticky top-6 overflow-hidden rounded-2xl bg-white shadow-xl lg:col-span-1">
            <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
              <h3 className="text-lg font-bold text-gray-900">Statistics</h3>
              <p className="text-sm text-gray-500">Custody time breakdown</p>
            </div>
            <div className="p-6">
              {/* Placeholder stats */}
              <div className="space-y-4">
                <div className="rounded-xl bg-blue-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-blue-500" />
                      <span className="font-medium text-gray-700">Parent A</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">50%</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-blue-100">
                    <div className="h-full w-1/2 rounded-full bg-blue-500" />
                  </div>
                </div>
                <div className="rounded-xl bg-pink-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-pink-500" />
                      <span className="font-medium text-gray-700">Parent B</span>
                    </div>
                    <span className="text-2xl font-bold text-pink-600">50%</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-pink-100">
                    <div className="h-full w-1/2 rounded-full bg-pink-500" />
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-4">
                <p className="text-center text-sm text-gray-400">
                  Charts and detailed statistics coming soon
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

function App() {
  return (
    <WizardProvider>
      <AppContent />
    </WizardProvider>
  );
}

export default App;
