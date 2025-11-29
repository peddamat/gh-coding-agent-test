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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header at top */}
      <Header onExportClick={handleExportClick} />

      {/* Main content area */}
      <Container>
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

export default App;
