'use client';

import { useState } from 'react';
import PageHeader from '@/components/navigation/PageHeader';
import { useRouter } from 'next/navigation';
import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/20/solid';

type NetworkErrorProps = {
  page: string;
  title?: string;
  message?: string;
  retryPath?: string;
};

export default function NetworkError({
  page = '',
  title = 'Network Error',
  message = '',
  retryPath,
}: NetworkErrorProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleRetry = () => {
    if (busy) return;
    setBusy(true);
    setTimeout(() => {
      if (retryPath) {
        router.replace(retryPath);
      } else {
        location.reload();
      }
    }, 120);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <PageHeader title={page} />

      <div
        className="mt-6 rounded-2xl"
        role="alert"
        aria-live="polite"
      >
        <div className="flex flex-col items-center text-center px-6 py-16">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-full
                          bg-amber-50/80 dark:bg-amber-900/20
                          ring-1 ring-amber-200/70 dark:ring-amber-800/60">
            <ExclamationTriangleIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          </div>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>

          {message && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 max-w-prose">
              {message}
            </p>
          )}

          <div className="mt-6">
            <button
              type="button"
              onClick={handleRetry}
              disabled={busy}
              className="group inline-flex items-center gap-2 rounded-full px-4 py-2
                         border border-blue-600 text-blue-700
                         hover:bg-blue-600 hover:text-white
                         dark:border-blue-500 dark:text-blue-300 dark:hover:bg-blue-500 dark:hover:text-white
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60
                         transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <ArrowPathIcon
                className={`h-5 w-5 ${busy ? 'animate-spin' : 'group-hover:rotate-180 transition-transform'}`}
                aria-hidden="true"
              />
              <span>{'{Erneut versuchen}'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
