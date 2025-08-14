'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { createPortal } from 'react-dom'
import clsx from 'clsx'

interface Option {
  id: string
  name: string
}

interface Props {
  label?: string
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export default function MultiSelectListbox({
  label,
  options,
  selected,
  onChange,
  placeholder = 'Select…',
  disabled = false,
  className,
}: Props) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null)

  const selectedItems = useMemo(() => options.filter(o => selected.includes(o.id)), [options, selected])
  const visible = selectedItems.slice(0, 2)
  const overflowCount = Math.max(0, selectedItems.length - visible.length)

  function toggleOption(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id))
    } else {
      onChange([...selected, id])
    }
  }

  const updatePos = () => {
    const r = btnRef.current?.getBoundingClientRect()
    if (!r) return
    setPos({ top: r.bottom + 8, left: r.left, width: r.width })
  }

  return (
    <div className={clsx('w-full', className)} data-row-link-ignore>
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-100">
          {label}
        </label>
      )}

      <Listbox as="div" disabled={disabled}>
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
              <ListboxButton
                ref={btnRef}
                aria-label={label || 'Multi select'}
                className={clsx(
                  'relative w-full cursor-default text-left rounded-2xl px-3 py-2.5',
                  'bg-white/70 dark:bg-gray-900/40 backdrop-blur-sm',
                  'ring-1 ring-gray-200/70 dark:ring-gray-800/60 shadow-sm',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
                  'transition',
                  disabled && 'opacity-60 cursor-not-allowed'
                )}
              >
                {selectedItems.length === 0 ? (
                  <span className="block truncate text-gray-500 dark:text-gray-400">
                    {placeholder}
                  </span>
                ) : (
                  <span className="flex flex-wrap gap-1.5 pr-7">
                    {visible.map((item) => (
                      <span
                        key={item.id}
                        className={clsx(
                          'inline-flex items-center rounded-full px-2 py-0.5',
                          'bg-gray-100/70 dark:bg-gray-800/60',
                          'text-gray-700 dark:text-gray-300',
                          'ring-1 ring-gray-200/70 dark:ring-gray-800/60'
                        )}
                        title={item.name}
                      >
                        {item.name}
                      </span>
                    ))}
                    {overflowCount > 0 && (
                      <span
                        className={clsx(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs',
                          'bg-gray-100/70 dark:bg-gray-800/60',
                          'text-gray-600 dark:text-gray-300',
                          'ring-1 ring-gray-200/70 dark:ring-gray-800/60'
                        )}
                      >
                        +{overflowCount}
                      </span>
                    )}
                  </span>
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
              </ListboxButton>

              {open && pos &&
                createPortal(
                  <ListboxOptions
                    static
                    className={clsx(
                      'fixed z-[1000] max-h-60 overflow-auto rounded-2xl p-1',
                      'bg-white/80 dark:bg-gray-900/60 backdrop-blur-sm',
                      'ring-1 ring-gray-200/70 dark:ring-gray-800/60 shadow-lg',
                      'focus:outline-none'
                    )}
                    style={{ top: pos.top, left: pos.left, width: pos.width }}
                  >
                    {options.map((option) => {
                      const isSelected = selected.includes(option.id)
                      return (
                        <ListboxOption
                          key={option.id}
                          value={option.id}
                          as="div"
                          onClick={() => toggleOption(option.id)}
                          className={({ active }) =>
                            clsx(
                              'relative cursor-pointer select-none rounded-xl px-3 py-2',
                              'text-sm flex items-center gap-2',
                              active
                                ? 'bg-gray-50/80 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100'
                                : 'text-gray-900 dark:text-gray-100'
                            )
                          }
                        >
                          <span
                            className={clsx(
                              'grid place-items-center h-5 w-5 rounded',
                              isSelected
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-transparent'
                            )}
                            aria-hidden="true"
                          >
                            <CheckIcon className="h-5 w-5" />
                          </span>
                          <span className={clsx('block truncate', isSelected && 'font-medium')}>
                            {option.name}
                          </span>
                        </ListboxOption>
                      )
                    })}
                  </ListboxOptions>,
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
