import { useState } from 'react';
import { CalendarGrid, MonthNavigation } from './components/calendar';
import { Header, Container } from './components/layout';

function App() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header at top */}
      <Header onExportClick={handleExportClick} />

      {/* Main content area */}
      <Container>
        {/* Responsive layout: stacks on mobile, side-by-side on desktop (prep for stats panel) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Calendar section - takes 2/3 on desktop */}
          <div className="lg:col-span-2">
            {/* Month Navigation below header */}
            <div className="mb-4 rounded-lg bg-white shadow">
              <MonthNavigation
                currentMonth={currentMonth}
                onPreviousMonth={handlePreviousMonth}
                onNextMonth={handleNextMonth}
              />
            </div>

            {/* Calendar Grid fills main area */}
            <CalendarGrid currentMonth={currentMonth} hideTitle />
          </div>

          {/* Stats panel placeholder - takes 1/3 on desktop */}
          <div className="rounded-lg bg-white p-4 shadow lg:col-span-1">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Stats Panel
            </h3>
            <p className="text-sm text-gray-500">
              Statistics and charts will appear here in a future update.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default App;
