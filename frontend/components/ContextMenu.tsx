'use client'

import { useI18n } from "@/locales/I18nContext";
import { useState, useRef, useEffect } from 'react'
import { EllipsisHorizontalIcon } from '@heroicons/react/20/solid';

type Props = {
  onEdit: () => void
  onDelete: () => void
}

export default function ContextMenu({ onEdit, onDelete }: Props) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { locale } = useI18n()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-5 h-5 m-2 rounded-full border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white flex items-center justify-center transition"
        title={locale.ui.context_menu}
      >
        <EllipsisHorizontalIcon />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <ul className="py-1 text-sm text-gray-700">
            <li>
              <button
                onClick={() => {
                  setOpen(false)
                  onEdit()
                }}
                className="w-full flex items-center px-4 py-2 hover:bg-gray-100"
              >
                {locale.buttons.edit}
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setOpen(false)
                  onDelete()
                }}
                className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 font-semibold"
              >
                {locale.buttons.delete}
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}