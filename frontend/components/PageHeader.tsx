'use client'

import { useI18n } from "@/locales/I18nContext";
import { useRouter } from 'next/navigation'

import {
  ChevronLeftIcon,
  PlusIcon
} from '@heroicons/react/20/solid'

type PageHeaderProps = {
  hasBack?: boolean
  title: string
  href?: string
}

export default function PageHeader({ hasBack = false, title, href }: PageHeaderProps) {
  const router = useRouter()
  const { locale } = useI18n()

  return (
    <div className="flex justify-between items-center mb-6 h-8">
      <h1 className="text-2xl font-bold flex items-center">
        {hasBack && (<button
            type="button"
            onClick={() => router.back()}
            aria-label={locale?.buttons.back || "Back"}
            title={locale?.buttons.back || "Back"}
            className="group inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition"
          >
            <ChevronLeftIcon className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
          </button>)}
        {title}
      </h1>
      {href && (
        <button
          type="button"
          onClick={() => router.push(href)}
          aria-label={locale?.buttons.create || "Create"}
          title={locale?.buttons.create || "Create"}
          className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary text-primary hover:bg-primary hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition"
        >
          <PlusIcon className="h-5 w-5 group-hover:rotate-90 transition-transform" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}