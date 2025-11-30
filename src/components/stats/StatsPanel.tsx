import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TimeshareDonutChart } from './TimeshareDonutChart';
import { MonthlyTrendBarChart } from './MonthlyTrendBarChart';
import type { TimeshareStats, ParentConfig, MonthlyBreakdown } from '../../types';

export interface StatsPanelProps {
  /** Timeshare statistics for both parents */
  stats: TimeshareStats;
  /** Parent A configuration */
  parentA: ParentConfig;
  /** Parent B configuration */
  parentB: ParentConfig;
  /** Monthly breakdown data for charts */
  monthlyData: MonthlyBreakdown[];
  /** Hex color for Parent A (e.g., '#3b82f6') */
  parentAColor: string;
  /** Hex color for Parent B (e.g., '#ec4899') */
  parentBColor: string;
}

/**
 * Breakpoint for mobile/desktop detection (lg: 1024px as per Tailwind convention)
 */
const LG_BREAKPOINT = 1024;

/**
 * Debounce delay for resize events in milliseconds
 */
const RESIZE_DEBOUNCE_MS = 150;

/**
 * Side panel component containing all custody statistics.
 * Features:
 * - TimeshareDonutChart showing custody split percentage
 * - Text summary with nights/year for each parent
 * - MonthlyTrendBarChart showing month-by-month breakdown
 * - Calculation Mode toggle placeholder
 * - Collapsible on mobile (< lg breakpoint), expanded by default on desktop
 */
export function StatsPanel({
  stats,
  parentA,
  parentB,
  monthlyData,
  parentAColor,
  parentBColor,
}: StatsPanelProps) {
  // Track if expanded (default: expanded on desktop, collapsed on mobile)
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= LG_BREAKPOINT;
    }
    return true;
  });

  // Ref for debounce timeout
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced resize handler
  const handleResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    resizeTimeoutRef.current = setTimeout(() => {
      if (window.innerWidth >= LG_BREAKPOINT) {
        setIsExpanded(true);
      } else {
        setIsExpanded(false);
      }
    }, RESIZE_DEBOUNCE_MS);
  }, []);

  // Listen for window resize to auto-expand on desktop
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [handleResize]);

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
      {/* Header - always visible */}
      <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="custody-summary-heading" className="text-lg font-bold text-gray-900">Custody Summary</h2>
            <p className="text-sm text-gray-500">Custody time breakdown</p>
          </div>
          {/* Toggle button - visible only on mobile */}
          <button
            onClick={toggleExpanded}
            className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
            aria-expanded={isExpanded}
            aria-controls="stats-panel-content"
          >
            {isExpanded ? (
              <>
                Hide Stats
                <ChevronUp className="h-4 w-4" aria-hidden="true" />
              </>
            ) : (
              <>
                View Stats
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Collapsible content */}
      <div
        id="stats-panel-content"
        role="region"
        aria-labelledby="custody-summary-heading"
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 lg:max-h-[2000px] lg:opacity-100'
        }`}
      >
        <div className="p-6">
          {/* Summary Section */}
          <div className="mb-6 space-y-2">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">{parentA.name}</span>:{' '}
              {stats.parentA.days} nights/year ({Math.round(stats.parentA.percentage)}%)
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">{parentB.name}</span>:{' '}
              {stats.parentB.days} nights/year ({Math.round(stats.parentB.percentage)}%)
            </p>
          </div>

          {/* Donut Chart */}
          <div className="mb-6">
            <TimeshareDonutChart
              parentAName={parentA.name}
              parentAPercent={stats.parentA.percentage}
              parentAColor={parentAColor}
              parentBName={parentB.name}
              parentBPercent={stats.parentB.percentage}
              parentBColor={parentBColor}
            />
          </div>

          {/* Monthly Trend Chart */}
          <div className="mb-6">
            <MonthlyTrendBarChart
              data={monthlyData}
              parentAName={parentA.name}
              parentAColor={parentAColor}
              parentBName={parentB.name}
              parentBColor={parentBColor}
            />
          </div>

          {/* Calculation Mode Toggle (MVP Placeholder) */}
          <div className="rounded-lg bg-gray-50 p-4">
            <label
              htmlFor="calculation-mode"
              className="block text-sm font-medium text-gray-700"
            >
              Calculation Mode:
            </label>
            <select
              id="calculation-mode"
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 py-2 pl-3 pr-10 text-base text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              defaultValue="overnights"
            >
              <option value="overnights">Overnights</option>
              <option value="hours">Hours (Coming Soon)</option>
            </select>
            <p className="mt-1 text-xs text-gray-400">
              Hours-based calculation coming in a future update
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
