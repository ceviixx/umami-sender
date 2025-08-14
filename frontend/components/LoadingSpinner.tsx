'use client';

import PageHeader from './navigation/PageHeader';

interface LoadingSpinnerProps {
  title: string;
  message?: string;
}

export default function LoadingSpinner({ title, message = '' }: LoadingSpinnerProps) {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <PageHeader title={title} />

      <div className="mt-6 rounded-2xl">
        <div className="flex flex-col items-center justify-center py-16" role="status" aria-live="polite">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200/70 dark:border-gray-800/60" />
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 dark:border-blue-500 border-t-transparent motion-safe:animate-spin" />
          </div>

          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            {message}
          </p>

          <span className="sr-only">{message}</span>
        </div>
      </div>
    </div>
  );
}
