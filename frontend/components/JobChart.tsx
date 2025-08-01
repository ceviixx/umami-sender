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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

type JobEntry = {
  date: string;    // adjust if you use Date objects or something else
  success: number;
  failed: number;
  skipped: number;
};

type JobLineChartProps = {
  jobData: JobEntry[];
};

const JobLineChart = ({ jobData }: JobLineChartProps) => {
  const labels = jobData.map((entry) => entry.date);

  const data = {
    labels,
    datasets: [
      {
        label: 'Success',
        data: jobData.map((entry) => entry.success),
        borderColor: '#4caf50',
        backgroundColor: '#4caf50',
        tension: 0.3,
        fill: false,
      },
      {
        label: 'Failed',
        data: jobData.map((entry) => entry.failed),
        borderColor: '#f44336',
        backgroundColor: '#f44336',
        tension: 0.3,
        fill: false,
      }
    ],
  };

  // Explicit type for options
  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,  // <-- here we use 'as const' to tell TypeScript this is a valid literal
        intersect: false,
      },
    },
    scales: {
      x: {
        title: {
          display: false,
          text: 'Date',
        },
      },
      y: {
        beginAtZero: true,
        suggestedMax:
          Math.max(...jobData.map((d) => Math.max(d.success, d.failed, d.skipped))) + 1,
        ticks: {
          stepSize: 1,
          callback: function (value: number | string) {
            return Number.isInteger(Number(value)) ? value : null;
          },
        },
        title: {
          display: false,
          text: 'Count',
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default JobLineChart;
