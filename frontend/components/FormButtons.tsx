'use client'

import { useI18n } from "@/locales/I18nContext";
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

type FormButtonsProps = {
  hasCancel?: boolean;
  cancelLabel?: string;
  saveLabel?: string;
  isSubmitting?: boolean;
  disabled?: boolean;
  onCancel?: () => void;
};

export default function FormButtons({
  hasCancel = true,
  cancelLabel = 'Cancel',
  saveLabel = 'Save',
  isSubmitting = false,
  disabled = false,
  onCancel,
}: FormButtonsProps) {
  const router = useRouter();
  const { locale } = useI18n();

  const isDisabled = isSubmitting || disabled;

  return (
    <div className="flex justify-end gap-2">
      {hasCancel && (
        <button
          type="button"
          onClick={onCancel || (() => router.back())}
          disabled={isSubmitting}
          className={clsx(
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            'text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700',
            'hover:bg-gray-200 dark:hover:bg-gray-600',
            isSubmitting && 'cursor-not-allowed opacity-70'
          )}
        >
          {cancelLabel}
        </button>
      )}

      <button
        type="submit"
        disabled={isDisabled}
        className={clsx(
          'px-4 py-2 rounded-md text-sm font-medium transition-colors text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50',
          !isDisabled
            ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
            : 'bg-blue-400 dark:bg-blue-700 cursor-not-allowed'
        )}
      >
        {isSubmitting ? locale.buttons.states.loading : saveLabel}
      </button>
    </div>
  );
}
