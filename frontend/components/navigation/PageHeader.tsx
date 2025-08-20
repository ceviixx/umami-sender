'use client'

import React from 'react'
import { useI18n } from "@/locales/I18nContext";
import { useRouter } from 'next/navigation'
import { ChevronLeftIcon, PlusIcon } from '@heroicons/react/20/solid'

type PageHeaderProps = {
  hasBack?: boolean
  title: string
  subtitle?: string
  /** Optionaler, bestehender Plus-Button (Navigation) */
  href?: string
  /** Neue API: rohe Actions (Buttons/Links/Dropdowns/whatever) */
  actions?: React.ReactNode | React.ReactNode[]
  /** Optional: zusätzliche Klassen für die Actions-Container-<div> */
  actionsClassName?: string
}

export default function PageHeader({
  hasBack = false,
  title,
  subtitle,
  href,
  actions,
  actionsClassName,
}: PageHeaderProps) {
  const router = useRouter()
  const { locale } = useI18n()

  const actionsArray = React.Children.toArray(actions)

  return (
    <div className="flex justify-between items-center mb-6 min-h-9">
      <hgroup className="flex items-start gap-2">
        {hasBack && (
          <button
            type="button"
            onClick={() => router.back()}
            aria-label={locale?.buttons.back || "Back"}
            title={locale?.buttons.back || "Back"}
            className="group inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition"
          >
            <ChevronLeftIcon className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
          </button>
        )}

        <div className="flex flex-col">
          <h1 className="text-2xl font-bold leading-tight">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </hgroup>

      <div className={`flex items-center gap-2 ${actionsClassName ?? ''}`}>
        {href && (
          <button
            type="button"
            onClick={() => router.push(href)}
            aria-label={locale?.buttons?.create ?? "Create"}
            title={locale?.buttons?.create ?? "Create"}
            className={[
              "group inline-flex h-9 w-9 items-center justify-center rounded-full",
              "bg-white/70 dark:bg-gray-900/40 backdrop-blur-sm",
              "ring-1 ring-gray-200/70 dark:ring-gray-800/60 shadow-sm",
              "text-gray-700 dark:text-gray-200",
              "hover:bg-gray-100/70 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white",
              "transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50",
              "active:scale-[.98]"
            ].join(" ")}
          >
            <PlusIcon className="h-5 w-5 transition-transform duration-200 group-hover:rotate-90" aria-hidden="true" />
          </button>
        )}

        {actionsArray.length > 0 && (
          <div className="flex items-center gap-2">
            {actionsArray}
          </div>
        )}
      </div>
    </div>
  )
}
