import { useState, useEffect, useCallback, useId } from 'react';
import { X } from 'lucide-react';
import FocusTrap from 'focus-trap-react';
import { CalendarGrid, MonthNavigation } from './components/calendar';
import { Header, Container } from './components/layout';
import { TimeshareDonutChart, MonthlyTrendBarChart } from './components/stats';
import { COLOR_OPTIONS } from './components/shared/colorOptions';
import { WizardContainer, PatternPicker, ParentSetup, HolidaySelector } from './components/wizard';
import { WizardProvider, useWizard } from './context';
import { getPatternByType } from './data/patterns';
import type { PatternType, MonthlyBreakdown } from './types';
import type { SplitType } from './data/patterns';
import type { ParentSetupData, HolidaySelection } from './components/wizard';

/** Static wizard steps configuration - defined outside component to avoid recreation on each render */
const WIZARD_STEPS = [
  { title: 'Choose Schedule', description: 'Select a custody schedule pattern' },
  { title: 'Parent Setup', description: 'Configure parent information' },
  { title: 'Holiday Settings', description: 'Set holiday custody rules' },
];

/** Mock monthly data for stats display */
const mockMonthlyData: MonthlyBreakdown[] = [
  { month: 'Jan', parentADays: 16, parentBDays: 15 },
  { month: 'Feb', parentADays: 14, parentBDays: 14 },
  { month: 'Mar', parentADays: 16, parentBDays: 15 },
  { month: 'Apr', parentADays: 15, parentBDays: 15 },
  { month: 'May', parentADays: 16, parentBDays: 15 },
  { month: 'Jun', parentADays: 15, parentBDays: 15 },
  { month: 'Jul', parentADays: 16, parentBDays: 15 },
  { month: 'Aug', parentADays: 16, parentBDays: 15 },
  { month: 'Sep', parentADays: 15, parentBDays: 15 },
  { month: 'Oct', parentADays: 16, parentBDays: 15 },
  { month: 'Nov', parentADays: 15, parentBDays: 15 },
  { month: 'Dec', parentADays: 16, parentBDays: 15 },
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
    setShowWizard(true);
    reset();
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
    reset();
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
        {wizardState.pattern && wizardState.split && !showWizard && (
          <section aria-labelledby="schedule-info-heading" className="mb-6 rounded-xl bg-white p-4 shadow-md">
            <h2 id="schedule-info-heading" className="sr-only">Current Schedule Information</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                  {wizardState.split}
                </span>
                <span className="font-medium text-gray-700">
                  {getPatternByType(wizardState.pattern)?.label || 'Unknown Pattern'}
                </span>
              </div>
              {wizardState.parentSetup.parentAName && wizardState.parentSetup.parentBName && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{wizardState.parentSetup.parentAName}</span>
                  <span aria-hidden="true">•</span>
                  <span>{wizardState.parentSetup.parentBName}</span>
                </div>
              )}
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
              {/* Timeshare Donut Chart */}
              <TimeshareDonutChart
                parentAName={wizardState.parentSetup.parentAName || 'Parent A'}
                parentAPercent={50}
                parentAColor={COLOR_OPTIONS.find(opt => opt.value === wizardState.parentSetup.parentAColor)?.preview || '#3b82f6'}
                parentBName={wizardState.parentSetup.parentBName || 'Parent B'}
                parentBPercent={50}
                parentBColor={COLOR_OPTIONS.find(opt => opt.value === wizardState.parentSetup.parentBColor)?.preview || '#ec4899'}
              />

              {/* Placeholder stats */}
              <div className="mt-6 space-y-4">
                <div className="rounded-xl bg-blue-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-blue-500" />
                      <span className="font-medium text-gray-700">{wizardState.parentSetup.parentAName || 'Parent A'}</span>
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
                      <span className="font-medium text-gray-700">{wizardState.parentSetup.parentBName || 'Parent B'}</span>
                    </div>
                    <span className="text-2xl font-bold text-pink-600">50%</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-pink-100">
                    <div className="h-full w-1/2 rounded-full bg-pink-500" />
                  </div>
                </div>
              </div>

              {/* Monthly Trend Bar Chart */}
              <div className="mt-6">
                <MonthlyTrendBarChart
                  data={mockMonthlyData}
                  parentAName={wizardState.parentSetup.parentAName || 'Parent A'}
                  parentAColor={COLOR_OPTIONS.find(opt => opt.value === wizardState.parentSetup.parentAColor)?.preview || '#3b82f6'}
                  parentBName={wizardState.parentSetup.parentBName || 'Parent B'}
                  parentBColor={COLOR_OPTIONS.find(opt => opt.value === wizardState.parentSetup.parentBColor)?.preview || '#ec4899'}
                />
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
