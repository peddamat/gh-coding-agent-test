import { Download, Calendar } from 'lucide-react';

export interface HeaderProps {
  /** Optional callback for when the export button is clicked */
  onExportClick?: () => void;
}

export function Header({ onExportClick }: HeaderProps) {
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
        <button
          onClick={onExportClick}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-150 hover:from-blue-500 hover:to-blue-600 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>
    </header>
  );
}
