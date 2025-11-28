import type { CalendarDay, ParentId } from '../types';

export function generateMockDays(month: number, year: number): CalendarDay[] {
  const days: CalendarDay[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const startDayOfWeek = firstDay.getDay();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // Fill in days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayOfMonth = prevMonthLastDay - i;
    const date = new Date(year, month - 1, dayOfMonth);
    const dateStr = date.toISOString().split('T')[0];
    const dayIndex = days.length;
    days.push({
      date: dateStr,
      dayOfMonth,
      owner: (dayIndex % 2 === 0 ? 'parentA' : 'parentB') as ParentId,
      isToday: dateStr === todayStr,
      isCurrentMonth: false,
    });
  }
  
  // Fill in days of current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    const dateStr = date.toISOString().split('T')[0];
    const dayIndex = days.length;
    days.push({
      date: dateStr,
      dayOfMonth: d,
      owner: (dayIndex % 2 === 0 ? 'parentA' : 'parentB') as ParentId,
      isToday: dateStr === todayStr,
      isCurrentMonth: true,
    });
  }
  
  // Fill remaining days from next month (to make 42 cells)
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d);
    const dateStr = date.toISOString().split('T')[0];
    const dayIndex = days.length;
    days.push({
      date: dateStr,
      dayOfMonth: d,
      owner: (dayIndex % 2 === 0 ? 'parentA' : 'parentB') as ParentId,
      isToday: dateStr === todayStr,
      isCurrentMonth: false,
    });
  }
  
  return days;
}
