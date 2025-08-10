'use client'

import { useI18n } from "@/locales/I18nContext";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  const { locale } = useI18n();

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">An error occured</h1>
      <p className="mb-4">{error.message}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try again
      </button>
    </div>
  )
}