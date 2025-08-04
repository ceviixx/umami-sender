'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format, subDays, addDays, parseISO, isSameDay } from 'date-fns';


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

type JobEntry = {
  date: string; // format: 'yyyy-MM-dd'
  success: number;
  failed: number;
  skipped: number;
};

type JobLineChartProps = {
  jobData: JobEntry[];
};

const generateLast7Days = (): string[] => {
  return Array.from({ length: 7 }).map((_, i) =>
    format(subDays(new Date(), 6 - i), 'yyyy-MM-dd')
  );
};

const fillMissingDays = (data: JobEntry[]): JobEntry[] => {
  const last7 = generateLast7Days();
  const map = new Map(data.map(d => [d.date, d]));

  return last7.map(date => {
    return (
      map.get(date) ?? {
        date,
        success: 0,
        failed: 0,
        skipped: 0,
      }
    );
  });
};

const JobLineChart = ({ jobData }: JobLineChartProps) => {
  const filledData = fillMissingDays(jobData);

  const labels = filledData.map((entry) => entry.date);

  const data = {
    labels,
    datasets: [
      {
        label: 'Success',
        data: filledData.map((entry) => entry.success),
        borderColor: '#4caf50',
        backgroundColor: '#4caf50',
        tension: 0.3,
        fill: false,
      },
      {
        label: 'Failed',
        data: filledData.map((entry) => entry.failed),
        borderColor: '#f44336',
        backgroundColor: '#f44336',
        tension: 0.3,
        fill: false,
      }
    ],
  };

  const options: ChartOptions<'line'> = {
  responsive: true,
  layout: {
    padding: { left: 16, right: 16 },
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      callbacks: {
        title: (tooltipItems) => {
          const raw = tooltipItems[0].label;
          return format(parseISO(raw), 'MMM dd'); // z. B. "Aug 04"
        },
      },
    },
  },
  scales: {
    x: {
      title: {
        display: false,
      },
      ticks: {
        display: true,
        color: '#6b728082',
        padding: 10,
        maxRotation: 45,
        minRotation: 45,
        callback: function (value, index, ticks) {
          const raw = this.getLabelForValue(value as number);
          return format(parseISO(raw), 'MMM dd'); // z. B. "Aug 04"
        },
      },
      grid: {
        drawTicks: false,
      },
    },
    y: {
      beginAtZero: true,
      suggestedMax:
        Math.max(...filledData.map((d) => Math.max(d.success, d.failed, d.skipped))) + 1,
      ticks: {
        display: true,
        color: '#6b728082',
        padding: 10,
        stepSize: 1,
        callback: function (value: number | string) {
          return Number.isInteger(Number(value)) ? value : null;
        },
      },
      title: {
        display: false,
      },
      grid: {
        drawTicks: false,
      },
    },
  },
};


  return <Line data={data} options={options} />;
};

export default JobLineChart;
