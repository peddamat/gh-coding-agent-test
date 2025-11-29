import { useState } from 'react';
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
 * Wizard content component that uses WizardContext.
 * Separated from AppContent to ensure context is available.
 */
function WizardContent({
  onFinish,
  onCancel,
}: {
  onFinish: () => void;
  onCancel: () => void;
}) {
  const { state, dispatch } = useWizard();

  const handlePatternSelect = (pattern: PatternType, split: SplitType) => {
    dispatch({ type: 'SET_PATTERN', payload: { pattern, split } });
  };

  const handleParentSetupChange = (parentSetup: ParentSetupData) => {
    dispatch({ type: 'SET_PARENTS', payload: parentSetup });
  };

  const handleHolidaySelectionsChange = (holidaySelections: HolidaySelection[]) => {
    dispatch({ type: 'SET_HOLIDAYS', payload: holidaySelections });
  };

  return (
    <WizardContainer
      steps={WIZARD_STEPS}
      onFinish={onFinish}
      onCancel={onCancel}
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
  );
}

/**
 * Main application content component.
 * Uses WizardContext for wizard state management.
 */
function AppContent() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [showWizard, setShowWizard] = useState(true);
  const { state: wizardState, toAppState } = useWizard();

  const handleExportClick = () => {
    // Placeholder for future export functionality
    console.log('Export clicked');
  };

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

  const handleWizardCancel = () => {
    setShowWizard(false);
  };

  // Show wizard modal when active
  if (showWizard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header onExportClick={handleExportClick} />
        <Container>
          <div className="mx-auto max-w-4xl py-8">
            <WizardContent onFinish={handleWizardFinish} onCancel={handleWizardCancel} />
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header at top */}
      <Header onExportClick={handleExportClick} />

      {/* Main content area */}
      <Container>
        {/* Button to reopen wizard */}
        <div className="mb-6">
          <button
            onClick={() => setShowWizard(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Open Wizard
          </button>
          {wizardState.pattern && (
            <span className="ml-4 text-gray-600">
              Selected: {wizardState.pattern} ({wizardState.split})
            </span>
          )}
        </div>

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
