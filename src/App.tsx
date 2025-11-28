import { useState, useMemo } from 'react';
import { Header, Container } from './components/layout';
import { CalendarGrid, MonthNavigation } from './components/calendar';
import { generateMockDays } from './utils/calendarUtils';

function App() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const handleExport = () => {
    // Placeholder export functionality
    console.log('Export clicked');
  };

  const days = useMemo(() => {
    return generateMockDays(currentMonth.getMonth(), currentMonth.getFullYear());
  }, [currentMonth]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onExport={handleExport} />
      <main>
        <Container>
          <div className="flex flex-col lg:flex-row lg:gap-8">
            {/* Calendar section */}
            <div className="flex-1">
              <MonthNavigation
                currentMonth={currentMonth}
                onPreviousMonth={handlePreviousMonth}
                onNextMonth={handleNextMonth}
              />
              <CalendarGrid
                days={days}
                parentAColor="bg-blue-500"
                parentBColor="bg-pink-500"
              />
            </div>
            {/* Stats panel placeholder - prep for future stats panel */}
            <div className="mt-8 lg:mt-0 lg:w-80">
              <div className="rounded-lg bg-white p-4 shadow">
                <h3 className="text-lg font-semibold text-gray-900">Statistics</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Stats panel coming soon...
                </p>
              </div>
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
}

export default App;
