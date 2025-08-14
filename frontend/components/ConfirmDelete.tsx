import { useI18n } from "@/locales/I18nContext";
import React from 'react';

export default function ConfirmDelete({
  open,
  onConfirm,
  onCancel,
  message,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message?: string;
}) {
  const { locale } = useI18n();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 w-full max-w-sm mx-4 z-10">
        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
          {locale.messages.confirm_delete}
        </h2>

        {message && (
          <div className="mb-5 text-gray-600 dark:text-gray-300 text-sm">
            {message}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors"
          >
            {locale.buttons.cancel}
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 transition-colors"
          >
            {locale.buttons.delete}
          </button>
        </div>
      </div>
    </div>
  );
}
