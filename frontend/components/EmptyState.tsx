'use client'

import { useRouter } from 'next/navigation'
import clsx from 'clsx'

type Props = {
  title?: string
  description?: string
  imageSrc?: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({
  title = 'No items found',
  description = 'There are no items to display here. You can create a new item to get started.',
  imageSrc = '/empty-illustration.svg',
  actionLabel,
  onAction,
}: Props) {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center text-center mt-24 px-4">
      <div className="w-32 h-32 mb-6 rounded-xl overflow-hidden shadow-sm bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <img
          src={imageSrc}
          alt={title}
          className="w-24 h-24 object-contain opacity-80"
        />
      </div>

      <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
        {title}
      </h2>

      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 max-w-md">
        {description}
      </p>

      {actionLabel && (
        <button
          onClick={onAction}
          className={clsx(
            'px-4 py-2 rounded-md text-sm font-medium transition-colors text-white',
            'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/50'
          )}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
