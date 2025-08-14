'use client'

import React, { useState } from 'react'

interface EmailListInputProps {
  value: string[]
  onChange: (emails: string[]) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  helpText?: string
}

export default function EmailListInput({
  value,
  onChange,
  label,
  placeholder = 'anna@example.com, max@org',
  disabled = false,
  helpText,
}: EmailListInputProps) {
  const [inputValue, setInputValue] = useState('')

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const addEmail = (raw: string) => {
    const trimmed = raw.trim().toLowerCase()
    if (!trimmed) return
    if (!isValidEmail(trimmed)) return
    if (value.includes(trimmed)) return
    onChange([...value, trimmed])
  }

  const addMany = (raw: string) => {
    const parts = raw.split(/[,\s;]+/g).filter(Boolean)
    const next = new Set(value.map(v => v.toLowerCase()))
    for (const p of parts) {
      const e = p.trim().toLowerCase()
      if (isValidEmail(e)) next.add(e)
    }
    onChange(Array.from(next))
  }

  const removeEmail = (email: string) => {
    onChange(value.filter(e => e !== email))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['Enter', ' ', ','].includes(e.key)) {
      e.preventDefault()
      addEmail(inputValue)
      setInputValue('')
    }
    if (e.key === 'Backspace' && inputValue === '' && value.length) {
      e.preventDefault()
      removeEmail(value[value.length - 1])
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text')
    if (/[,\s;]/.test(text)) {
      e.preventDefault()
      addMany(text)
    }
  }

  const handleBlur = () => {
    if (inputValue) {
      addEmail(inputValue)
      setInputValue('')
    }
  }

  return (
    <div className="flex flex-col gap-1" data-row-link-ignore>
      {label && (
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          {label}
        </label>
      )}

      <div
        className={[
          'flex flex-wrap items-center gap-2',
          'rounded-2xl px-3 py-2.5',
          'bg-white/70 dark:bg-gray-900/40 backdrop-blur-sm',
          'ring-1 ring-gray-200/70 dark:ring-gray-800/60',
          'focus-within:ring-2 focus-within:ring-blue-500/50',
          'transition',
          disabled ? 'opacity-60 pointer-events-none' : ''
        ].join(' ')}
      >
        {value.map(email => (
          <span
            key={email}
            className={[
              'group inline-flex items-center gap-1 pl-2 pr-1 py-1 rounded-full text-sm',
              'bg-gray-100/70 dark:bg-gray-800/50',
              'text-gray-800 dark:text-gray-200',
              'ring-1 ring-gray-200/70 dark:ring-gray-700/60'
            ].join(' ')}
          >
            {email}
            <button
              type="button"
              onClick={(ev) => {
                ev.stopPropagation()
                removeEmail(email)
              }}
              className={[
                'inline-flex h-5 w-5 items-center justify-center rounded-full',
                'text-gray-500 dark:text-gray-400',
                'hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40',
                'transition'
              ].join(' ')}
              aria-label={`Remove ${email}`}
            >
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M11.414 10l3.182-3.182a1 1 0 1 0-1.414-1.414L10 8.586 6.818 5.404a1 1 0 0 0-1.414 1.414L8.586 10l-3.182 3.182a1 1 0 1 0 1.414 1.414L10 11.414l3.182 3.182a1 1 0 0 0 1.414-1.414L11.414 10z"
                />
              </svg>
            </button>
          </span>
        ))}

        <input
          type="text"
          value={inputValue}
          disabled={disabled}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="flex-1 min-w-[9rem] border-0 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-0 focus:outline-none"
        />
      </div>

      {helpText && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {helpText}
        </p>
      )}
    </div>
  )
}
