import { useI18n } from "@/locales/I18nContext";
import React from 'react'

export default function ConfirmDelete({
  open,
  onConfirm,
  onCancel,
  message,
}: {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  message?: string
}) {
  const { locale } = useI18n()

  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-xs">
        <h2 className="text-lg font-semibold mb-4">{locale.messages.confirm_delete}</h2>
        <div className="mb-4">{message}</div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            {locale.buttons.cancel}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            {locale.buttons.delete}
          </button>
        </div>
      </div>
    </div>
  )
}