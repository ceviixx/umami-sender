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
          onClick={() => router.back()}
          className="w-8 h-8 m-2 text-gray-600 hover:text-blue flex items-center justify-center transition"
          title={locale.buttons.back}
        >
          <ChevronLeftIcon className="text-blue-600 w-12 h-12 hover:text-blue-600" />
        </button>)}
        {title}
      </h1>
      {href && (
        <button
          onClick={() => router.push(href)}
          className="w-8 h-8 m-2 rounded-full  border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition"
          title={locale.buttons.create}
        >
          <PlusIcon className="text-blue-600 w-12 h-12 hover:text-white" />
        </button>
      )}
    </div>
  )
}