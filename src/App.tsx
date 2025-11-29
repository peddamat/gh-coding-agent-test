import { Header, Container } from './components/layout';
import { DayCell } from './components/calendar/DayCell';
import type { CalendarDay } from './types';

function App() {
  const handleExportClick = () => {
    // Placeholder for future export functionality
    console.log('Export clicked');
  };

  // Sample days to showcase DayCell component
  const sampleDays: CalendarDay[] = [
    { date: '2025-01-15', dayOfMonth: 15, owner: 'parentA', isToday: false, isCurrentMonth: true },
    { date: '2025-01-16', dayOfMonth: 16, owner: 'parentB', isToday: false, isCurrentMonth: true },
    { date: '2025-01-17', dayOfMonth: 17, owner: 'parentA', isToday: true, isCurrentMonth: true },
    { date: '2024-12-31', dayOfMonth: 31, owner: 'parentB', isToday: false, isCurrentMonth: false },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onExportClick={handleExportClick} />
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Custody Calculator
          </h1>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Container>
          {/* Test Tailwind classes - bg-blue-500 */}
          <div className="rounded-lg bg-blue-500 p-4 text-white shadow">
            <p>Tailwind CSS is working! This box uses bg-blue-500.</p>
          </div>
        </Container>
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">DayCell Component Demo</h2>
          <div className="flex flex-wrap gap-4">
            {sampleDays.map((day) => (
              <div key={day.date} className="flex flex-col items-center gap-2">
                <DayCell
                  day={day}
                  parentAColor="bg-blue-500"
                  parentBColor="bg-pink-500"
                />
                <span className="text-xs text-gray-600">
                  {day.isToday ? 'Today' : day.isCurrentMonth ? 'Current Month' : 'Previous Month'}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <p>Blue = Parent A, Pink = Parent B</p>
            <p>Bold border = Today indicator</p>
            <p>Dimmed = Not current month</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
