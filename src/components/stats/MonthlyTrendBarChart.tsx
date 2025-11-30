import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { MonthlyBreakdown } from '../../types';

// Register Chart.js components for bar chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export interface MonthlyTrendBarChartProps {
  /** Monthly breakdown data for each month */
  data: MonthlyBreakdown[];
  /** Parent A display name */
  parentAName: string;
  /** Parent A color (hex value, e.g., '#3b82f6') */
  parentAColor: string;
  /** Parent B display name */
  parentBName: string;
  /** Parent B color (hex value, e.g., '#ec4899') */
  parentBColor: string;
}

/**
 * Stacked bar chart component showing monthly custody breakdown between two parents.
 * Displays custody days per month with each parent's portion stacked.
 */
export function MonthlyTrendBarChart({
  data,
  parentAName,
  parentAColor,
  parentBName,
  parentBColor,
}: MonthlyTrendBarChartProps) {
  const chartData: ChartData<'bar'> = useMemo(
    () => ({
      labels: data.map((d) => d.month),
      datasets: [
        {
          label: parentAName,
          data: data.map((d) => d.parentADays),
          backgroundColor: parentAColor,
          borderColor: parentAColor,
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: parentBName,
          data: data.map((d) => d.parentBDays),
          backgroundColor: parentBColor,
          borderColor: parentBColor,
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    }),
    [data, parentAName, parentAColor, parentBName, parentBColor]
  );

  const options: ChartOptions<'bar'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 16,
            font: {
              size: 12,
              family: 'system-ui, -apple-system, sans-serif',
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y || 0;
              return `${label}: ${value} days`;
            },
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          grid: {
            display: false,
          },
          ticks: {
            font: {
              size: 11,
            },
          },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          grid: {
            color: '#f3f4f6', // gray-100
          },
          ticks: {
            font: {
              size: 11,
            },
          },
          title: {
            display: true,
            text: 'Days',
            font: {
              size: 12,
            },
          },
        },
      },
    }),
    []
  );

  // Calculate totals for screen reader
  const totalParentADays = data.reduce((sum, d) => sum + d.parentADays, 0);
  const totalParentBDays = data.reduce((sum, d) => sum + d.parentBDays, 0);

  return (
    <div className="flex flex-col" aria-label="Monthly custody trend chart">
      {/* Screen reader accessible content */}
      <div className="sr-only">
        Monthly custody breakdown: {parentAName} has {totalParentADays} total days, {parentBName}{' '}
        has {totalParentBDays} total days across {data.length} months.
      </div>
      <h4 className="mb-3 text-sm font-semibold text-gray-700">Monthly Trend</h4>
      <div className="w-full">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
