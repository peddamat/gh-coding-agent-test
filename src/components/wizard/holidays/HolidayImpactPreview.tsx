import { useMemo } from 'react';
import clsx from 'clsx';
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { HolidayImpactBreakdown } from '../../../types/holidays';

/** Props for HolidayImpactPreview */
export interface HolidayImpactPreviewProps {
  /** Base schedule percentage for Parent A (without holidays) */
  basePercentageA: number;
  /** Base schedule percentage for Parent B (without holidays) */
  basePercentageB: number;
  /** Holiday impact breakdown by category */
  impactBreakdown: HolidayImpactBreakdown;
  /** Display name for Parent A */
  parentAName?: string;
  /** Display name for Parent B */
  parentBName?: string;
  /** Threshold for showing deviation warning (percentage) */
  deviationThreshold?: number;
}

/**
 * Format a number to display with proper sign.
 */
function formatDelta(value: number): string {
  if (value > 0) return `+${value}`;
  if (value < 0) return `${value}`;
  return '0';
}

/**
 * Category impact row component.
 */
function ImpactRow({
  label,
  parentADays,
  parentBDays,
  parentAName,
  parentBName,
}: {
  label: string;
  parentADays: number;
  parentBDays: number;
  parentAName: string;
  parentBName: string;
}) {
  const totalDays = parentADays + parentBDays;
  
  if (totalDays === 0) return null;

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-3 text-sm">
        {parentADays !== 0 && (
          <span className="text-blue-600">
            {formatDelta(parentADays)} days {parentAName}
          </span>
        )}
        {parentBDays !== 0 && (
          <span className="text-pink-600">
            {formatDelta(parentBDays)} days {parentBName}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Holiday Impact Preview Panel component.
 * Shows the impact of holiday configuration on custody percentages.
 */
export function HolidayImpactPreview({
  basePercentageA,
  basePercentageB,
  impactBreakdown,
  parentAName = 'Parent A',
  parentBName = 'Parent B',
  deviationThreshold = 10,
}: HolidayImpactPreviewProps) {
  // Calculate adjusted percentages
  const { adjustedPercentages, totalDelta, deviation } = useMemo(() => {
    const totalImpactA =
      impactBreakdown.majorBreaks.parentADays +
      impactBreakdown.weekendHolidays.parentADays +
      impactBreakdown.birthdays.parentADays;
    const totalImpactB =
      impactBreakdown.majorBreaks.parentBDays +
      impactBreakdown.weekendHolidays.parentBDays +
      impactBreakdown.birthdays.parentBDays;

    // Total holiday days
    const totalHolidayDays = totalImpactA + totalImpactB;
    
    // Assuming a year has 365 days
    const baseDaysA = (basePercentageA / 100) * 365;
    const baseDaysB = (basePercentageB / 100) * 365;
    
    // Holiday Impact Calculation:
    // When holidays override the base schedule, we need to account for:
    // 1. The days ADDED to each parent from holidays (totalImpactA/B)
    // 2. The days REMOVED from base schedule that are now holidays
    // 
    // Example: If base is 50/50 (182.5 days each) and there are 20 holiday days:
    // - Without override: Each parent would have ~10 of those holiday days (50%)
    // - With override: Parent A might get 15 holidays, Parent B gets 5
    // 
    // So adjusted = baseDays + holidayDaysGained - holidayDaysFromBase
    //             = baseDays + totalImpactX - (totalHolidayDays * basePercentageX / 100)
    const adjustedDaysA = baseDaysA + totalImpactA - (totalHolidayDays * basePercentageA / 100);
    const adjustedDaysB = baseDaysB + totalImpactB - (totalHolidayDays * basePercentageB / 100);
    
    const totalDays = adjustedDaysA + adjustedDaysB;
    const adjustedA = totalDays > 0 ? (adjustedDaysA / totalDays) * 100 : 50;
    const adjustedB = totalDays > 0 ? (adjustedDaysB / totalDays) * 100 : 50;

    // Net change in days
    const netChangeA = totalImpactA - (totalHolidayDays * basePercentageA / 100);
    const netChangeB = totalImpactB - (totalHolidayDays * basePercentageB / 100);
    
    // Who gained?
    const delta =
      netChangeB > netChangeA
        ? { parent: parentBName, days: Math.round(netChangeB - netChangeA) }
        : netChangeA > netChangeB
        ? { parent: parentAName, days: Math.round(netChangeA - netChangeB) }
        : null;

    // Deviation from base
    const deviationPercent = Math.abs(adjustedA - basePercentageA);

    return {
      adjustedPercentages: {
        parentA: Math.round(adjustedA * 10) / 10,
        parentB: Math.round(adjustedB * 10) / 10,
      },
      totalDelta: delta,
      deviation: Math.round(deviationPercent * 10) / 10,
    };
  }, [basePercentageA, basePercentageB, impactBreakdown, parentAName, parentBName]);

  // Determine trend icon
  const TrendIcon = totalDelta
    ? totalDelta.parent === parentAName
      ? TrendingUp
      : TrendingDown
    : Minus;

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <h4 className="font-semibold text-gray-900">Holiday Impact Preview</h4>
      </div>

      <div className="p-4 space-y-4">
        {/* Base vs Adjusted comparison */}
        <div className="grid grid-cols-2 gap-4">
          {/* Base Schedule */}
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="text-sm font-medium text-gray-500 mb-2">Base Schedule</div>
            <div className="flex items-baseline gap-2">
              <span className={clsx('text-xl font-bold', 'text-blue-600')}>
                {basePercentageA.toFixed(1)}%
              </span>
              <span className="text-gray-400">/</span>
              <span className={clsx('text-xl font-bold', 'text-pink-600')}>
                {basePercentageB.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* With Holidays */}
          <div className="rounded-lg bg-blue-50 p-3">
            <div className="text-sm font-medium text-gray-500 mb-2">With Holidays</div>
            <div className="flex items-baseline gap-2">
              <span className={clsx('text-xl font-bold', 'text-blue-600')}>
                {adjustedPercentages.parentA.toFixed(1)}%
              </span>
              <span className="text-gray-400">/</span>
              <span className={clsx('text-xl font-bold', 'text-pink-600')}>
                {adjustedPercentages.parentB.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Delta indicator */}
        {totalDelta && totalDelta.days > 0 && (
          <div
            className={clsx(
              'flex items-center gap-2 rounded-lg p-3',
              totalDelta.parent === parentAName ? 'bg-blue-50' : 'bg-pink-50'
            )}
          >
            <TrendIcon
              className={clsx(
                'h-5 w-5',
                totalDelta.parent === parentAName ? 'text-blue-500' : 'text-pink-500'
              )}
            />
            <span
              className={clsx(
                'text-sm font-medium',
                totalDelta.parent === parentAName ? 'text-blue-700' : 'text-pink-700'
              )}
            >
              {totalDelta.parent} gains {totalDelta.days} days
            </span>
          </div>
        )}

        {/* Breakdown by category */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Breakdown</div>
          <div className="rounded-lg border border-gray-200 p-3">
            <ImpactRow
              label="Major Breaks"
              parentADays={impactBreakdown.majorBreaks.parentADays}
              parentBDays={impactBreakdown.majorBreaks.parentBDays}
              parentAName={parentAName}
              parentBName={parentBName}
            />
            <ImpactRow
              label="Weekend Holidays"
              parentADays={impactBreakdown.weekendHolidays.parentADays}
              parentBDays={impactBreakdown.weekendHolidays.parentBDays}
              parentAName={parentAName}
              parentBName={parentBName}
            />
            <ImpactRow
              label="Birthdays"
              parentADays={impactBreakdown.birthdays.parentADays}
              parentBDays={impactBreakdown.birthdays.parentBDays}
              parentAName={parentAName}
              parentBName={parentBName}
            />
          </div>
        </div>

        {/* Deviation warning */}
        {deviation > deviationThreshold && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-sm font-medium text-amber-700">
                Significant Deviation
              </span>
              <p className="text-sm text-amber-600">
                Result differs from base schedule by {deviation.toFixed(1)}%
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
