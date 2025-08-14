'use client'

import React from 'react'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import { ChevronRightIcon } from '@heroicons/react/20/solid'

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger'

const badgeToneClasses: Record<BadgeTone, string> = {
  neutral:
    'bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700/60',
  success:
    'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800/60',
  warning:
    'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-800/60',
  danger:
    'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-800/60',
}

export const toBadgeTone = (s?: string): BadgeTone => {
  switch (s) {
    case 'success': return 'success'
    case 'skipped':  return 'warning'
    case 'failed':   return 'danger'
    default:         return 'neutral'
  }
}

type CardItemProps = {
  title: string | React.ReactNode
  subtitle?: string | React.ReactNode
  badge?: string | React.ReactNode
  badgeTone?: BadgeTone

  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  iconContainerClassName?: string
  iconClassName?: string

  href?: string

  rightSlot?: React.ReactNode
  className?: string

  bottomSlot?: React.ReactNode
}

export default function CardItem({
  title,
  subtitle,
  badge,
  badgeTone = 'neutral',
  icon: Icon,
  iconContainerClassName,
  iconClassName,
  href,
  rightSlot,
  className = '',
  bottomSlot,
}: CardItemProps) {
  const router = useRouter()

  const handleRowClick = (e: React.MouseEvent) => {
    if (!href) return
    const t = e.target as HTMLElement
    if (t.closest('button, a, [role="menu"], [role="switch"], [data-row-link-ignore]')) return
    router.push(href)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (!href) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      router.push(href)
    }
  }

  const clickable = Boolean(href)

  return (
    <li
      className={clsx(
        'relative px-4 py-3 sm:px-5 sm:py-4 rounded-2xl',
        'ring-1 ring-gray-200/70 dark:ring-gray-800/60',
        'bg-white/70 dark:bg-gray-900/40 backdrop-blur-sm shadow-sm',
        clickable && 'cursor-pointer hover:bg-gray-50/70 dark:hover:bg-gray-800/50',
        clickable && 'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60',
        clickable ? 'group/row' : undefined,
        className
      )}
      role={clickable ? 'link' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={handleRowClick}
      onKeyDown={handleKey}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <span className={clsx(
            'h-10 w-10 shrink-0 grid place-items-center rounded-full',
            'bg-gray-100/70 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300',
            'ring-1 ring-gray-200/70 dark:ring-gray-800/60',
            iconContainerClassName
          )}>
            <Icon className={clsx('h-5 w-5', iconClassName)} />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900 dark:text-gray-100 whitespace-normal break-words">
              {title}
            </p>
            {typeof badge === 'string' ? (
              <span className={clsx(
                'shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs ring-1',
                badgeToneClasses[badgeTone]
              )}>
                {badge}
              </span>
            ) : (
              badge && <span className="shrink-0">{badge}</span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-normal break-words">
              {subtitle}
            </p>
          )}
        </div>

        {(rightSlot || clickable) && (
          <div
            className="ml-2 flex items-center gap-2 pl-2 sm:pl-3 shrink-0 whitespace-nowrap"
            data-row-link-ignore
          >
            {rightSlot}
            {clickable && (
              <ChevronRightIcon
                className={clsx(
                  'h-5 w-5 text-gray-300 dark:text-gray-500 transition-transform',
                  'group-hover/row:translate-x-0.5'
                )}
                aria-hidden="true"
              />
            )}
          </div>
        )}
      </div>

      {bottomSlot ? (
        <div className="mt-3 space-y-4 rounded-xl border border-gray-200 dark:border-gray-800/60 bg-gray-50/60 dark:bg-gray-800/40 p-4">
          {bottomSlot}
        </div>
      ) : null}
    </li>

  )
}
