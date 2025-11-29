import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import type { ChartData, ChartOptions, Plugin } from 'chart.js';
import { determinePrimaryParent } from './utils';

export interface TimeshareDonutChartProps {
  /** Parent A display name */
  parentAName: string;
  /** Parent A custody percentage (0-100, should sum to 100 with parentBPercent) */
  parentAPercent: number;
  /** Parent A color (hex value, e.g., '#3b82f6') */
  parentAColor: string;
  /** Parent B display name */
  parentBName: string;
  /** Parent B custody percentage (0-100, should sum to 100 with parentAPercent) */
  parentBPercent: number;
  /** Parent B color (hex value, e.g., '#ec4899') */
  parentBColor: string;
}

/**
 * Donut chart component showing custody split percentage between two parents.
 * Displays a donut/pie chart with segments for each parent, center text showing
 * the primary parent's percentage, and a legend with parent names.
 */
export function TimeshareDonutChart({
  parentAName,
  parentAPercent,
  parentAColor,
  parentBName,
  parentBPercent,
  parentBColor,
}: TimeshareDonutChartProps) {
  // Runtime validation: warn if percentages do not sum to 100
  const sum = parentAPercent + parentBPercent;
  if (Math.abs(sum - 100) > 0.01) {
    console.warn(
      `TimeshareDonutChart: parentAPercent (${parentAPercent}) + parentBPercent (${parentBPercent}) = ${sum}, expected 100.`
    );
  }

  // Determine primary parent (the one with higher or equal percentage)
  const { primaryName, primaryPercent } = determinePrimaryParent(
    parentAName,
    parentAPercent,
    parentBName,
    parentBPercent
  );

  const data: ChartData<'doughnut'> = useMemo(() => ({
    labels: [parentAName, parentBName],
    datasets: [
      {
        data: [parentAPercent, parentBPercent],
        backgroundColor: [parentAColor, parentBColor],
        borderColor: ['#ffffff', '#ffffff'],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  }), [parentAName, parentBName, parentAPercent, parentBPercent, parentAColor, parentBColor]);

  // Custom plugin to render center text
  const centerTextPlugin: Plugin<'doughnut'> = useMemo(() => ({
    id: 'centerText',
    afterDraw: (chart) => {
      const { ctx, width, height } = chart;
      ctx.save();

      // Calculate center position
      const centerX = width / 2;
      const centerY = height / 2;

      // Draw percentage
      ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#1f2937'; // gray-800
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.round(primaryPercent)}%`, centerX, centerY - 8);

      // Draw "primary" label below percentage
      ctx.font = '12px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#6b7280'; // gray-500
      ctx.fillText(primaryName, centerX, centerY + 14);

      ctx.restore();
    },
  }), [primaryPercent, primaryName]);

  const options: ChartOptions<'doughnut'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: true,
    cutout: '65%', // Control donut hole size (60-70% as recommended)
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
          font: {
            size: 14,
            family: 'system-ui, -apple-system, sans-serif',
          },
          generateLabels: (chart) => {
            const datasets = chart.data.datasets;
            const labels = chart.data.labels as string[];
            
            if (!datasets.length || !labels) return [];
            
            const dataset = datasets[0];
            const chartData = dataset.data as number[];
            const backgroundColor = dataset.backgroundColor as string[];
            
            return labels.map((label, index) => ({
              text: `${label}: ${Math.round(chartData[index])}%`,
              fillStyle: backgroundColor[index],
              strokeStyle: backgroundColor[index],
              hidden: false,
              index,
              fontColor: '#374151', // gray-700
            }));
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${Math.round(value)}%`;
          },
        },
      },
    },
  }), []);

  return (
    <div className="flex flex-col items-center" aria-label="Custody time split chart">
      {/* Screen reader accessible content */}
      <div className="sr-only">
        Custody time split: {parentAName} has {Math.round(parentAPercent)}% and {parentBName} has {Math.round(parentBPercent)}%
      </div>
      <div className="w-full max-w-xs">
        <Doughnut data={data} options={options} plugins={[centerTextPlugin]} />
      </div>
    </div>
  );
}
