'use client'

import { useI18n } from "@/locales/I18nContext";
import { useRouter } from 'next/navigation'

type FormButtonsProps = {
  hasCancel?: boolean
  cancelLabel?: string
  saveLabel?: string
  isSubmitting?: boolean
  disabled?: boolean
  onCancel?: () => void
}

export default function FormButtons({
  hasCancel = true,
  cancelLabel = 'Cancel',
  saveLabel = 'Save',
  isSubmitting = false,
  disabled = false,
  onCancel,
}: FormButtonsProps) {
  const router = useRouter()
  const { locale } = useI18n();

  return (
    <div className="flex justify-end gap-2 pt-4">
      {hasCancel && (
        <button
          type="button"
          onClick={onCancel || (() => router.back())}
          className={`px-4 py-2 rounded transition-colors
            ${isSubmitting
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-black dark:text-white'}`}
          disabled={isSubmitting}
        >
          {cancelLabel}
        </button>
      )}

      <button
        type="submit"
        className={`px-4 py-2 text-white rounded transition-colors
      ${isSubmitting || disabled
            ? 'bg-blue-300 dark:bg-blue-800 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'}`}
        disabled={isSubmitting || disabled}
      >
        {isSubmitting ? locale.buttons.states.loading : saveLabel}
      </button>
    </div>

  )
}