import { Download, Calendar, Plus, RotateCcw } from 'lucide-react';

export interface HeaderProps {
  /** Optional callback for when the export button is clicked */
  onExportClick?: () => void;
  /** Optional callback for when the "Start New Schedule" button is clicked */
  onNewScheduleClick?: () => void;
  /** Optional callback for when the "Reset" button is clicked */
  onResetClick?: () => void;
}

export function Header({ onExportClick, onNewScheduleClick, onResetClick }: HeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Custody Calculator
            </h1>
            <p className="text-sm text-gray-500">Plan and visualize your parenting schedule</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {onResetClick && (
            <button
              onClick={onResetClick}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-150 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          )}
          {onNewScheduleClick && (
            <button
              onClick={onNewScheduleClick}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-white px-5 py-2.5 text-sm font-semibold text-blue-600 shadow-sm transition-all duration-150 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <Plus className="h-4 w-4" />
              Start New Schedule
            </button>
          )}
          <button
            onClick={onExportClick}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-150 hover:from-blue-500 hover:to-blue-600 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>
    </header>
  );
}
