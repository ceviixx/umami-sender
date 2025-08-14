'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Listbox } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { createPortal } from 'react-dom'
import clsx from 'clsx'

interface Option {
  label: string
  value: string | number
}

interface Props {
  label?: string
  value: string | number | null
  onChange: (value: string | null) => void
  options: Option[]
  placeholder?: string
  disabled?: boolean
  canClear?: boolean
  hasCheckbox?: boolean
  className?: string
}

export default function SelectBox({
  value,
  onChange,
  options,
  label,
  placeholder = 'Select…',
  disabled = false,
  canClear = false,
  hasCheckbox = true,
  className,
}: Props) {
  const selected = useMemo(
    () => options.find(opt => opt.value === value) || null,
    [options, value]
  )

  const btnRef = useRef<HTMLButtonElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null)

  const updatePos = () => {
    const r = btnRef.current?.getBoundingClientRect()
    if (!r) return
    setPos({ top: r.bottom + 8, left: r.left, width: r.width })
  }

  return (
    <div className={clsx('w-full', className)} data-row-link-ignore>
      {label && (
        <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
          {label}
        </label>
      )}

      <Listbox value={value} onChange={onChange} disabled={disabled}>
        {({ open }) => {
          useEffect(() => {
            if (!open) return
            updatePos()
            const onScroll = () => updatePos()
            const onResize = () => updatePos()
            window.addEventListener('scroll', onScroll, true)
            window.addEventListener('resize', onResize)
            return () => {
              window.removeEventListener('scroll', onScroll, true)
              window.removeEventListener('resize', onResize)
            }
          }, [open])

          return (
            <div className="relative">
              <Listbox.Button
                ref={btnRef}
                className={clsx(
                  'relative w-full cursor-default text-left rounded-2xl px-3 py-2.5',
                  'bg-white/70 dark:bg-gray-900/40 backdrop-blur-sm',
                  'ring-1 ring-gray-200/70 dark:ring-gray-800/60 shadow-sm',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
                  !disabled && 'hover:bg-gray-50/70 dark:hover:bg-gray-800/50 transition',
                  disabled && 'opacity-60 cursor-not-allowed'
                )}
                aria-label={label || 'Select'}
              >
                <span className={clsx('block truncate', !selected && 'text-gray-500 dark:text-gray-400')}>
                  {selected?.label || placeholder}
                </span>

                {selected && canClear && !disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onChange(null)
                    }}
                    title="Clear"
                    aria-label="Clear"
                    className="absolute inset-y-0 right-8 my-auto h-5 w-5 grid place-items-center rounded-full
                               text-gray-400 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400
                               focus:outline-none"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}

                <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                  <ChevronUpDownIcon
                    className={clsx(
                      'h-5 w-5 text-gray-400 dark:text-gray-300 transition-transform',
                      open && 'rotate-180'
                    )}
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>

              {open && pos &&
                createPortal(
                  <Listbox.Options
                    static
                    className={clsx(
                      'fixed z-[1000] max-h-60 overflow-auto p-1',
                      'rounded-2xl bg-white/80 dark:bg-gray-900/60 backdrop-blur-sm',
                      'ring-1 ring-gray-200/70 dark:ring-gray-800/60 shadow-lg',
                      'focus:outline-none'
                    )}
                    style={{
                      top: pos.top,
                      left: pos.left,
                      width: pos.width,
                    }}
                  >
                    {options.map((opt) => (
                      <Listbox.Option
                        key={opt.value}
                        value={opt.value}
                        className={({ active, selected }) =>
                          clsx(
                            'relative select-none rounded-xl px-3 py-2 text-sm flex items-center gap-2 cursor-pointer',
                            active
                              ? 'bg-gray-50/80 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100'
                              : 'text-gray-900 dark:text-gray-100',
                            selected && !hasCheckbox && 'font-medium'
                          )
                        }
                      >
                        {({ selected }) => (
                          <>
                            {hasCheckbox && (
                              <span
                                className={clsx(
                                  'grid place-items-center h-5 w-5 rounded',
                                  selected
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-transparent'
                                )}
                                aria-hidden="true"
                              >
                                <CheckIcon className="h-5 w-5" />
                              </span>
                            )}
                            <span className="block truncate">{opt.label}</span>
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>,
                  document.body
                )
              }
            </div>
          )
        }}
      </Listbox>
    </div>
  )
}
