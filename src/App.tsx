import { useState, useEffect, useCallback, useId, useMemo } from 'react';
import { X } from 'lucide-react';
import FocusTrap from 'focus-trap-react';
import { CalendarGrid, MonthNavigation } from './components/calendar';
import { Header, Container } from './components/layout';
import { StatsPanel } from './components/stats';
import { COLOR_OPTIONS } from './components/shared/colorOptions';
import { WizardContainer, PatternPicker, ParentSetup, HolidaySelector } from './components/wizard';
import { WizardProvider, useWizard, AppStateProvider, useAppState } from './context';
import { getPatternByType } from './data/patterns';
import { useCustodyEngine } from './hooks';
import type { PatternType, AppConfig } from './types';
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
  const titleId = useId();

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
    <FocusTrap>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
        />

        {/* Modal container */}
        <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-auto mx-4" tabIndex={-1}>
          {/* Hidden title for accessibility */}
          <h2 id={titleId} className="sr-only">Schedule Setup Wizard</h2>
          
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
    </FocusTrap>
  );
}

/**
 * Main application content component.
 * Uses WizardContext for wizard state management and AppStateContext for persistence.
 */
function AppContent() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const { toAppState, reset } = useWizard();
  const { state: appState, dispatch: dispatchAppState, isLoaded } = useAppState();

  // Determine if wizard should be shown:
  // - Show on first load if AppState is still at default (no customization saved)
  // - Don't show if user has already configured their schedule
  const [showWizard, setShowWizard] = useState(false);
  
  // Check if AppState has been customized (not default parent names)
  useEffect(() => {
    if (isLoaded) {
      // If parent names are still defaults, show wizard
      const hasDefaultParents = 
        appState.parents.parentA.name === 'Parent A' && 
        appState.parents.parentB.name === 'Parent B';
      setShowWizard(hasDefaultParents);
    }
  }, [isLoaded, appState.parents.parentA.name, appState.parents.parentB.name]);

  // Build AppConfig from AppState (persisted state takes priority)
  const appConfig: AppConfig = useMemo(() => appState.config, [appState.config]);

  // Use the custody engine for calculations
  const { getYearlyStats } = useCustodyEngine(appConfig);

  // Calculate yearly stats for the current year
  const yearlyStats = useMemo(() => {
    return getYearlyStats(currentMonth.getFullYear());
  }, [getYearlyStats, currentMonth]);

  const handleExportClick = () => {
    // Placeholder for future export functionality
    console.log('Export clicked');
  };

  const handleNewScheduleClick = useCallback(() => {
    setShowWizard(true);
    reset();
  }, [reset]);

  const handleResetClick = useCallback(() => {
    // Reset AppState to defaults and show wizard
    dispatchAppState({ type: 'RESET' });
    reset();
    setShowWizard(true);
  }, [dispatchAppState, reset]);

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
    const newAppState = toAppState();
    
    // Dispatch to AppState for persistence
    dispatchAppState({ type: 'SET_CONFIG', payload: newAppState.config });
    dispatchAppState({ type: 'SET_PARENTS', payload: newAppState.parents });
    
    console.log('Wizard finished with AppState:', newAppState);
  };

  const handleWizardClose = () => {
    reset();
    setShowWizard(false);
  };

  // Show loading state until AppState is loaded from localStorage
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-gray-500" role="status" aria-live="polite">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header at top */}
      <Header
        onExportClick={handleExportClick}
        onNewScheduleClick={handleNewScheduleClick}
        onResetClick={handleResetClick}
      />

      {/* Wizard modal overlay */}
      <WizardModal
        isOpen={showWizard}
        onClose={handleWizardClose}
        onFinish={handleWizardFinish}
      />

      {/* Main content area */}
      <Container>
        {/* Current schedule info - using AppState */}
        {!showWizard && (
          <section aria-labelledby="schedule-info-heading" className="mb-6 rounded-xl bg-white p-4 shadow-md">
            <h2 id="schedule-info-heading" className="sr-only">Current Schedule Information</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                  {getPatternByType(appState.config.selectedPattern)?.split || '50/50'}
                </span>
                <span className="font-medium text-gray-700">
                  {getPatternByType(appState.config.selectedPattern)?.label || 'Unknown Pattern'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{appState.parents.parentA.name}</span>
                <span aria-hidden="true">•</span>
                <span>{appState.parents.parentB.name}</span>
              </div>
            </div>
          </section>
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

              {/* Calendar Grid fills main area - reads from AppState */}
              <div className="p-6">
                <CalendarGrid
                  currentMonth={currentMonth}
                  hideTitle
                  appConfig={appConfig}
                  parentAColor={appState.parents.parentA.colorClass}
                  parentBColor={appState.parents.parentB.colorClass}
                  parentAName={appState.parents.parentA.name}
                  parentBName={appState.parents.parentB.name}
                />
              </div>
            </div>
          </div>

          {/* Stats panel - takes 1/3 on desktop - reads from AppState */}
          <div className="sticky top-6 lg:col-span-1">
            <StatsPanel
              stats={{
                parentA: yearlyStats.parentA,
                parentB: yearlyStats.parentB,
              }}
              parentA={{
                name: appState.parents.parentA.name,
                colorClass: appState.parents.parentA.colorClass,
              }}
              parentB={{
                name: appState.parents.parentB.name,
                colorClass: appState.parents.parentB.colorClass,
              }}
              monthlyData={yearlyStats.monthlyBreakdown}
              parentAColor={COLOR_OPTIONS.find(opt => opt.value === appState.parents.parentA.colorClass)?.preview || '#3b82f6'}
              parentBColor={COLOR_OPTIONS.find(opt => opt.value === appState.parents.parentB.colorClass)?.preview || '#ec4899'}
            />
          </div>
        </div>
      </Container>
    </div>
  );
}

function App() {
  return (
    <AppStateProvider>
      <WizardProvider>
        <AppContent />
      </WizardProvider>
    </AppStateProvider>
  );
}

export default App;
