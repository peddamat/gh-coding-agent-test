import { Download } from 'lucide-react';

export interface HeaderProps {
  /** Optional callback for when the export button is clicked */
  onExportClick?: () => void;
}

export function Header({ onExportClick }: HeaderProps) {
  return (
    <header className="bg-white shadow">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Custody Calculator
        </h1>
        <button
          onClick={onExportClick}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>
    </header>
  );
}
