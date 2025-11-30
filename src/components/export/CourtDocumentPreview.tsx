import { useState, useCallback, useMemo } from 'react';
import { Printer, Copy, X, Check } from 'lucide-react';
import clsx from 'clsx';
import type { AppState } from '../../types';
import {
  generateCourtDocument,
  generatePlainText,
  type CourtDocument,
  type CourtDocumentSection,
  type TableData,
} from '../../utils/courtDocumentGenerator';

export interface CourtDocumentPreviewProps {
  /** Application state used to generate the document */
  appState: AppState;
  /** Callback when close button is clicked (if in modal) */
  onClose?: () => void;
  /** Callback when print button is clicked */
  onPrint?: () => void;
  /** Callback when copy text button is clicked */
  onCopyText?: () => void;
}

/**
 * Renders a court document section based on its type.
 */
function DocumentSection({ section }: { section: CourtDocumentSection }) {
  switch (section.type) {
    case 'header':
      return (
        <div className="text-center text-lg font-bold uppercase tracking-wide">
          {section.content as string}
        </div>
      );

    case 'section-title':
      return (
        <h2 className="mb-3 mt-6 border-b-2 border-gray-800 pb-1 text-base font-bold uppercase tracking-wide">
          {section.content as string}
        </h2>
      );

    case 'paragraph':
      return (
        <p className="mb-4 text-justify leading-relaxed">
          {Array.isArray(section.content)
            ? section.content.join(' ')
            : (section.content as string)}
        </p>
      );

    case 'table': {
      const table = section.content as TableData;
      return (
        <div className="mb-4 overflow-x-auto">
          <table className="w-full border-collapse border border-gray-800 text-sm">
            <thead>
              <tr className="bg-gray-100">
                {table.headers.map((header, i) => (
                  <th
                    key={i}
                    className="border border-gray-800 px-3 py-2 text-left font-semibold"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 1 ? 'bg-gray-50' : ''}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="border border-gray-800 px-3 py-2"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'footnote':
      return (
        <p className="mb-2 text-xs italic text-gray-600">
          * {section.content as string}
        </p>
      );

    default:
      return null;
  }
}

/**
 * Renders the footnotes section of the document.
 */
function Footnotes({ footnotes }: { footnotes: string[] }) {
  if (footnotes.length === 0) return null;

  return (
    <div className="mt-8 border-t border-gray-300 pt-4">
      <h3 className="mb-2 text-sm font-bold uppercase">Notes</h3>
      <ol className="list-decimal space-y-2 pl-4 text-xs text-gray-700">
        {footnotes.map((note, i) => (
          <li key={i}>{note}</li>
        ))}
      </ol>
    </div>
  );
}

/**
 * Court Document Preview Component
 *
 * Renders a preview of the court document with court-style formatting.
 * Provides toolbar buttons for printing, copying text, and closing.
 *
 * Features:
 * - Centered header with court name
 * - Section titles in bold/uppercase
 * - Tables with borders for holiday assignments
 * - Odd/even year columns clearly labeled
 * - Footnotes at bottom
 * - Print-friendly CSS
 */
export function CourtDocumentPreview({
  appState,
  onClose,
  onPrint,
  onCopyText,
}: CourtDocumentPreviewProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  // Generate the document from app state
  const courtDocument: CourtDocument = useMemo(
    () => generateCourtDocument(appState),
    [appState]
  );

  // Generate plain text for copy functionality
  const plainText = useMemo(
    () => generatePlainText(courtDocument),
    [courtDocument]
  );

  const handlePrint = useCallback(() => {
    if (onPrint) {
      onPrint();
    }
    window.print();
  }, [onPrint]);

  const handleCopyText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(plainText);
      setCopySuccess(true);
      if (onCopyText) {
        onCopyText();
      }
      // Reset success state after 2 seconds
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textArea = window.document.createElement('textarea');
      textArea.value = plainText;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      window.document.body.appendChild(textArea);
      textArea.select();
      window.document.execCommand('copy');
      window.document.body.removeChild(textArea);
      setCopySuccess(true);
      if (onCopyText) {
        onCopyText();
      }
      setTimeout(() => setCopySuccess(false), 2000);
    }
  }, [plainText, onCopyText]);

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="no-print flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className={clsx(
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150',
              'bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
            )}
          >
            <Printer className="h-4 w-4" />
            Download PDF
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            className={clsx(
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150',
              copySuccess
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            )}
          >
            {copySuccess ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Text
              </>
            )}
          </button>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={clsx(
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150',
              'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <X className="h-4 w-4" />
            Close
          </button>
        )}
      </div>

      {/* Document Preview Area */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <div className="court-document mx-auto max-w-3xl rounded-lg bg-white p-8 shadow-lg print:max-w-none print:rounded-none print:p-0 print:shadow-none">
          {/* Document Header */}
          <div className="mb-8 text-center">
            {courtDocument.sections
              .filter((s) => s.type === 'header')
              .map((section, i) => (
                <DocumentSection key={`header-${i}`} section={section} />
              ))}
          </div>

          {/* Document Title */}
          {courtDocument.sections
            .filter(
              (s) =>
                s.type === 'section-title' &&
                (s.content as string).includes('HOLIDAY AND VACATION PLAN')
            )
            .map((section, i) => (
              <div key={`title-${i}`} className="mb-6 border-b-2 border-t-2 border-gray-800 py-3 text-center">
                <h1 className="text-xl font-bold uppercase tracking-wide">
                  {section.content as string}
                </h1>
              </div>
            ))}

          {/* Parent Information */}
          {courtDocument.sections
            .filter(
              (s) =>
                s.type === 'paragraph' &&
                typeof s.content === 'string' &&
                (s.content as string).includes('In the matter of')
            )
            .map((section, i) => (
              <div key={`matter-${i}`} className="mb-6 text-center">
                <p className="italic">
                  {section.content as string}
                </p>
                <p className="mt-2">Case No: _______________</p>
              </div>
            ))}

          {/* Horizontal Rule */}
          <hr className="mb-6 border-gray-400" />

          {/* Document Body Sections */}
          {courtDocument.sections
            .filter(
              (s) =>
                s.type !== 'header' &&
                !(
                  s.type === 'section-title' &&
                  (s.content as string).includes('HOLIDAY AND VACATION PLAN')
                ) &&
                !(
                  s.type === 'paragraph' &&
                  typeof s.content === 'string' &&
                  (s.content as string).includes('In the matter of')
                )
            )
            .map((section, i) => (
              <DocumentSection key={`section-${i}`} section={section} />
            ))}

          {/* Footnotes */}
          <Footnotes footnotes={courtDocument.footnotes} />
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            background: white !important;
          }
          
          .court-document {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.5;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0.5in !important;
          }
          
          table {
            border-collapse: collapse;
            width: 100%;
            page-break-inside: avoid;
          }
          
          th, td {
            border: 1px solid black;
            padding: 4px 8px;
          }
          
          h1, h2, h3 {
            page-break-after: avoid;
          }
          
          p {
            orphans: 2;
            widows: 2;
          }
        }
      `}</style>
    </div>
  );
}
