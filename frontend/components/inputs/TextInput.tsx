'use client'

import React from 'react'
import clsx from 'clsx'

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  description?: string
  error?: string
  className?: string
}

export default function TextInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  disabled,
  type = 'text',
  description,
  error,
  className,
  id,
  ...rest
}: TextInputProps) {
  const inputId = id ?? name
  const describedBy = [
    description ? `${inputId}-desc` : null,
    error ? `${inputId}-err` : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined

  return (
    <div className="w-full" data-row-link-ignore>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error || undefined}
        aria-describedby={describedBy}
        className={clsx(
          'block w-full rounded-2xl px-3 py-2.5',
          'bg-white/70 dark:bg-gray-900/40 backdrop-blur-sm',
          'ring-1 ring-inset ring-gray-200/70 dark:ring-gray-800/60 shadow-sm',
          'placeholder-gray-400 dark:placeholder-gray-500',
          'text-gray-900 dark:text-gray-100',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
          !disabled && 'hover:bg-gray-50/70 dark:hover:bg-gray-800/50 transition',
          disabled && 'opacity-60 cursor-not-allowed',
          error && 'ring-rose-300 dark:ring-rose-700 focus:ring-rose-500/60',
          className
        )}
        {...rest}
      />

      {description && !error && (
        <p id={`${inputId}-desc`} className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}

      {error && (
        <p id={`${inputId}-err`} className="mt-1 text-xs text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  )
}
