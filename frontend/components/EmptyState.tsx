'use client'

import { useI18n } from "@/locales/I18nContext";
import { useRouter } from 'next/navigation'

type Props = {
  title?: string 
  description?: string
  imageSrc?: string
}

export default function EmptyState({
  title = 'No items found',
  description = 'There are no items to display here. You can create a new item to get started.',
  imageSrc = '/empty-illustration.svg',
}: Props) {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center text-center mt-24 text-gray-600">
      <div className="w-32 h-32 mb-4">
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-contain opacity-80"
        />
      </div>
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="mb-4 text-sm text-gray-500">{description}</p>
    </div>
  )
}