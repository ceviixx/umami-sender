'use client'

import { useCallback } from 'react'
import clsx from 'clsx'

type Option = { value: string; label: string }
type CheckboxPickerProps = {
  options: Option[]
  selectedOptions: string[]
  onChange: (arg: { name: string; value: string[] }) => void
  name: string
}

export default function CheckboxPicker({
  options,
  selectedOptions,
  onChange,
  name,
}: CheckboxPickerProps) {
  const toggle = useCallback(
    (value: string) => {
      const next = selectedOptions.includes(value)
        ? selectedOptions.filter(v => v !== value)
        : [...selectedOptions, value]
      onChange({ name, value: next })
    },
    [name, onChange, selectedOptions]
  )

  return (
    <div className="flex flex-wrap gap-2" data-row-link-ignore>
      {options.map((opt) => {
        const id = `${name}-${opt.value}`
        const isSelected = selectedOptions.includes(opt.value)

        return (
          <div key={opt.value} className="relative">
            <input
              id={id}
              type="checkbox"
              className="sr-only"
              checked={isSelected}
              onChange={() => toggle(opt.value)}
            />

            <label
              htmlFor={id}
              role="checkbox"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault()
                  toggle(opt.value)
                }
              }}
              className={clsx(
                'relative inline-flex items-center rounded-full px-3 py-1.5 text-sm cursor-pointer select-none transition',
                'bg-white/70 dark:bg-gray-900/40 backdrop-blur-sm',
                'ring-1 ring-gray-200/70 dark:ring-gray-800/60',
                'hover:bg-gray-100/70 dark:hover:bg-gray-800/60',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60',
                isSelected && 'pl-7',
              )}
            >
              {isSelected && (
                <span className="absolute left-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white">
                  <svg viewBox="0 0 20 20" className="h-3 w-3" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M7.629 13.233a1 1 0 0 1-1.414 0l-2.448-2.448a1 1 0 1 1 1.414-1.414l1.741 1.741 5.173-5.173a1 1 0 1 1 1.414 1.414l-5.88 5.88Z"
                    />
                  </svg>
                </span>
              )}

              <span
                className={clsx(
                  'truncate',
                  isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
                )}
              >
                {opt.label}
              </span>
            </label>
          </div>
        )
      })}
    </div>
  )
}
