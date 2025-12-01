import { useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import { X, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import type { TrackBreak, ParentId } from '../../types';
import { canClaimVacation, daysBetween, getTodayDateString } from '../../hooks/useCustodyEngine';

interface TrackBreakClaimModalProps {
  /** The track break to claim */
  trackBreak: TrackBreak;
  /** Callback when claim is made */
  onClaim: (trackBreakId: string, claimedBy: ParentId, claimDate: string, weeks: number) => void;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Name of Parent A for display */
  parentAName?: string;
  /** Name of Parent B for display */
  parentBName?: string;
  /** Number of days before break that vacation must be claimed (default 30) */
  noticeDeadline?: number;
}

/**
 * Calculate the number of weeks in a track break.
 */
function calculateWeeks(startDate: string, endDate: string): number {
  const days = daysBetween(endDate, startDate) + 1; // +1 to include both start and end dates
  return Math.ceil(days / 7);
}

/**
 * Format a date string for display (e.g., "January 15, 2025").
 */
function formatDateForDisplay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Modal for claiming vacation time on a track break.
 * Validates that the claim is made at least 30 days before the break starts.
 */
export function TrackBreakClaimModal({
  trackBreak,
  onClaim,
  onClose,
  parentAName = 'Parent A',
  parentBName = 'Parent B',
  noticeDeadline = 30,
}: TrackBreakClaimModalProps) {
  const [selectedParent, setSelectedParent] = useState<ParentId | null>(null);
  const [validation, setValidation] = useState<{ valid: boolean; reason?: string }>({ valid: true });

  // Freeze today's date at component mount for consistent display
  // We use this for displaying "days until break" but recalculate for actual validation/claims
  const today = useMemo(() => getTodayDateString(), []);
  const weeks = calculateWeeks(trackBreak.startDate, trackBreak.endDate);
  const daysUntilBreak = daysBetween(trackBreak.startDate, today);

  // Parent names for error messages - use defaults to ensure they're never undefined
  const parentNames = useMemo(() => ({
    parentA: parentAName ?? 'Parent A',
    parentB: parentBName ?? 'Parent B',
  }), [parentAName, parentBName]);

  // Validate on mount and when track break or selected parent changes
  // Uses the memoized today value for validation since modal won't typically stay open past midnight
  useEffect(() => {
    if (selectedParent) {
      const result = canClaimVacation(trackBreak, selectedParent, today, noticeDeadline, parentNames);
      setValidation(result);
    } else {
      // Pre-validate to check deadline even before parent selection
      const result = canClaimVacation(trackBreak, 'parentA', today, noticeDeadline, parentNames);
      setValidation(result);
    }
  }, [trackBreak, selectedParent, today, noticeDeadline, parentNames]);

  const handleClaim = () => {
    if (!selectedParent || !validation.valid) return;
    // Use the memoized today value - this is the date when the user opened the modal
    onClaim(trackBreak.id, selectedParent, today, weeks);
    onClose();
  };

  const isAlreadyClaimed = !!trackBreak.vacationClaimed;
  const canSubmit = selectedParent !== null && validation.valid && !isAlreadyClaimed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Claim Track Break</h2>
              <p className="text-sm text-gray-500">{trackBreak.name}</p>
            </div>
          </div>
        </div>

        {/* Track Break Details */}
        <div className="mb-6 rounded-lg bg-gray-50 p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Start Date</span>
              <p className="font-medium text-gray-900">{formatDateForDisplay(trackBreak.startDate)}</p>
            </div>
            <div>
              <span className="text-gray-500">End Date</span>
              <p className="font-medium text-gray-900">{formatDateForDisplay(trackBreak.endDate)}</p>
            </div>
            <div>
              <span className="text-gray-500">Duration</span>
              <p className="font-medium text-gray-900">{weeks} week{weeks !== 1 ? 's' : ''}</p>
            </div>
            <div>
              <span className="text-gray-500">Days Until Break</span>
              <p className="font-medium text-gray-900">{daysUntilBreak} day{daysUntilBreak !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Validation Status */}
        {isAlreadyClaimed && (
          <div className="mb-6 flex items-start gap-3 rounded-lg bg-yellow-50 p-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">Already Claimed</p>
              <p className="text-sm text-yellow-700">
                This track break was claimed by {trackBreak.vacationClaimed?.claimedBy === 'parentA' ? parentAName : parentBName} on{' '}
                {formatDateForDisplay(trackBreak.vacationClaimed?.claimDate || '')}.
              </p>
            </div>
          </div>
        )}

        {!validation.valid && !isAlreadyClaimed && (
          <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
            <div>
              <p className="font-medium text-red-800">Cannot Claim</p>
              <p className="text-sm text-red-700">{validation.reason}</p>
            </div>
          </div>
        )}

        {validation.valid && !isAlreadyClaimed && (
          <div className="mb-6 flex items-start gap-3 rounded-lg bg-green-50 p-4">
            <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Eligible to Claim</p>
              <p className="text-sm text-green-700">
                Notice deadline met ({daysUntilBreak} days remaining, {noticeDeadline} required).
              </p>
            </div>
          </div>
        )}

        {/* Parent Selection */}
        {!isAlreadyClaimed && validation.valid && (
          <div className="mb-6">
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Select Claiming Parent
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedParent('parentA')}
                className={clsx(
                  'rounded-lg border-2 p-3 text-center transition-all',
                  {
                    'border-blue-500 bg-blue-50 text-blue-700': selectedParent === 'parentA',
                    'border-gray-200 text-gray-700 hover:border-gray-300': selectedParent !== 'parentA',
                  }
                )}
              >
                <span className="block font-medium">{parentAName}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedParent('parentB')}
                className={clsx(
                  'rounded-lg border-2 p-3 text-center transition-all',
                  {
                    'border-pink-500 bg-pink-50 text-pink-700': selectedParent === 'parentB',
                    'border-gray-200 text-gray-700 hover:border-gray-300': selectedParent !== 'parentB',
                  }
                )}
              >
                <span className="block font-medium">{parentBName}</span>
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          {!isAlreadyClaimed && (
            <button
              type="button"
              onClick={handleClaim}
              disabled={!canSubmit}
              className={clsx(
                'flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors',
                {
                  'bg-blue-600 hover:bg-blue-700': canSubmit,
                  'cursor-not-allowed bg-gray-300': !canSubmit,
                }
              )}
            >
              Claim Vacation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
