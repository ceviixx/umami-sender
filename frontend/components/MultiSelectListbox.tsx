'use client'

import { Listbox } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'

interface Option {
  id: number
  name: string
}

interface Props {
  label?: string
  options: Option[]
  selected: number[]
  onChange: (selected: number[]) => void
  placeholder?: string
  disabled?: boolean
}

export default function MultiSelectListbox({
  label,
  options,
  selected,
  onChange,
  placeholder = 'Select...',
  disabled = false,
}: Props) {
  // Hilfsfunktion: toggelt ein Element in selected rein oder raus
  function toggleOption(id: number) {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id))
    } else {
      onChange([...selected, id])
    }
  }

  return (
    <div className="w-full">
      {label && <label className="block mb-1 font-medium text-sm text-gray-700">{label}</label>}

      <Listbox as="div" disabled={disabled}>
        <div className="relative">
          <Listbox.Button
            className={`relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'text-gray-900'}`}
          >
            {selected.length === 0
              ? <span className="block truncate">{placeholder}</span>
              : <span className="block truncate">
                  {options
                    .filter(o => selected.includes(o.id))
                    .map(o => o.name)
                    .join(', ')}
                </span>
            }
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>

          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white border border-gray-200 py-1 text-base shadow-lg focus:outline-none sm:text-sm">
            {options.map(option => (
              <Listbox.Option
                key={option.id}
                as="div"
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                  }`
                }
                onClick={() => toggleOption(option.id)}
              >
                <span className={`block truncate ${selected.includes(option.id) ? 'font-medium' : 'font-normal'}`}>
                  {option.name}
                </span>
                {selected.includes(option.id) && (
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  )
}
