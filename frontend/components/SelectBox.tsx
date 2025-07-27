'use client'

import { Listbox } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/20/solid'

interface Option {
  label: string
  value: string
}

interface Props {
  label?: string
  value: string
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
  disabled?: boolean
  canClear?: boolean
  hasCheckbox?: boolean
}

export default function SelectBox({
  value,
  onChange,
  options,
  label,
  placeholder,
  disabled,
  canClear = false,
  hasCheckbox = true
}: Props) {
  const selected = options.find(opt => opt.value === value) || null

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Listbox.Button
            className={`relative w-full cursor-default rounded-md border bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              disabled ? 'bg-gray-100 text-gray-400' : 'border-gray-300'
            }`}
          >

            
            <span className="block truncate">
              {selected?.label || placeholder}
            </span>

            {/* "X" zum Zurücksetzen */}
            {selected && canClear && (
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  onChange(null)
                }}
                className="absolute inset-y-0 right-8 flex items-center pr-2 cursor-pointer"
                title="Auswahl löschen"
              >
                <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-red-500" />
              </span>
            )}
            

            {/* Chevron Icon */}
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
            </span>
          </Listbox.Button>

          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white border border-gray-200 py-1 text-base shadow-lg focus:outline-none sm:text-sm">
            {options.map(opt => (
              <Listbox.Option
                key={opt.value}
                value={opt.value}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 ${hasCheckbox ? ('pl-10') : ('pl-4')} pr-4 ${
                    active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                  }`
                }
              >
                {({ selected }) => (
                  <>
                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                      {opt.label}
                    </span>
                    {selected && hasCheckbox && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  )
}
