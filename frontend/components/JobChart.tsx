'use client';

import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  type ChartOptions,
  type Plugin,
  type ScriptableContext,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format, subDays, parseISO } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

type JobEntry = { date: string; success: number; failed: number; skipped: number; };
type Props = { jobData: JobEntry[]; height?: number; className?: string };

const last7 = () =>
  Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), 'yyyy-MM-dd'));

const fillMissing = (data: JobEntry[]) => {
  const need = last7();
  const map = new Map(data.map(d => [d.date, d]));
  return need.map(date => map.get(date) ?? { date, success: 0, failed: 0, skipped: 0 });
};

const rgba = (hex: string, a: number) => {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
};

const hoverLine: Plugin<'line'> = {
  id: 'hoverLine',
  afterDatasetsDraw(chart) {
    const { ctx, tooltip, chartArea } = chart;
    const active = tooltip?.getActiveElements?.() ?? [];
    if (!active.length) return;
    const x = active[0].element.x;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, chartArea.top);
    ctx.lineTo(x, chartArea.bottom);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(107,114,128,0.35)';
    ctx.stroke();
    ctx.restore();
  },
};

export default function JobLineChart({ jobData, height = 300, className = '' }: Props) {
  const filled = useMemo(() => fillMissing(jobData), [jobData]);
  const labels = useMemo(() => filled.map(d => d.date), [filled]);

  const colSuccess = '#10b981'; 
  const colSkipped = '#f59e0b'; 
  const colFailed  = '#ef4444'; 

  const gradient =
    (hex: string, top = 0.18, bottom = 0.02) =>
    (ctx: ScriptableContext<'line'>) => {
      const { chart } = ctx;
      const { ctx: c, chartArea } = chart;
      if (!chartArea) return rgba(hex, 0.12);
      const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      g.addColorStop(0, rgba(hex, top));
      g.addColorStop(1, rgba(hex, bottom));
      return g;
    };

  const data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: 'Success',
          data: filled.map(e => e.success),
          borderColor: colSuccess,
          backgroundColor: gradient(colSuccess),
          pointBackgroundColor: colSuccess,
          pointBorderColor: '#ffffff',
          pointRadius: 3,
          pointHoverRadius: 5,
          borderWidth: 2,
          tension: 0.35,
          fill: true,
        },
        {
          label: 'Skipped',
          data: filled.map(e => e.skipped),
          borderColor: colSkipped,
          backgroundColor: gradient(colSkipped),
          pointBackgroundColor: colSkipped,
          pointBorderColor: '#ffffff',
          pointRadius: 3,
          pointHoverRadius: 5,
          borderDash: [6, 4],
          borderWidth: 2,
          tension: 0.35,
          fill: true,
        },
        {
          label: 'Failed',
          data: filled.map(e => e.failed),
          borderColor: colFailed,
          backgroundColor: gradient(colFailed),
          pointBackgroundColor: colFailed,
          pointBorderColor: '#ffffff',
          pointRadius: 3,
          pointHoverRadius: 5,
          borderWidth: 2,
          tension: 0.35,
          fill: true,
        },
      ],
    }),
    [labels, filled]
  );

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { left: 12, right: 12, top: 6, bottom: 6 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderWidth: 1,
        titleColor: '#111827',
        bodyColor: '#111827',
        padding: 10,
        displayColors: true,
        callbacks: {
          title(items) {
            const raw = items[0]?.label || '';
            return format(parseISO(raw), 'MMM dd');
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'rgba(107,114,128,0.7)',
          padding: 8,
          maxRotation: 0,
          autoSkip: true,
          callback(value) {
            const raw = labels[Number(value)] as string;
            return format(parseISO(raw), 'MMM dd');
          },
        },
        grid: {
          color: 'rgba(17,24,39,0.06)',
          drawTicks: false,
        },
      },
      y: {
        beginAtZero: true,
        suggestedMax:
          Math.max(...filled.map(d => Math.max(d.success, d.failed, d.skipped))) + 1,
        ticks: {
          color: 'rgba(107,114,128,0.7)',
          padding: 8,
          stepSize: 1,
          callback: (v) => (Number.isInteger(Number(v)) ? (v as any) : ''),
        },
        grid: {
          color: 'rgba(17,24,39,0.06)',
          drawTicks: false,
        },
      },
    },
  };

  return (
    <div
      className={`relative w-full ${className}`}
      style={{ height }}
    >
      <Line data={data} options={options} plugins={[hoverLine]} />
    </div>
  );
}
