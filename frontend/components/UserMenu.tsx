'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/locales/I18nContext'
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'

export default function UserMenu() {
  const router = useRouter()
  const { locale } = useI18n()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    localStorage.clear()
    router.push('/login')
  }

  const handleProfile = () => {
    setOpen(false)
    router.push('/account')
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        title={locale.buttons.account}
        className="text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white transition-colors"
      >
        <UserCircleIcon className="h-6 w-6" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-md ring-1 ring-black/5 dark:ring-white/10 z-50 py-1 text-sm">
          <button
            onClick={handleProfile}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {locale.pages.account}
          </button>

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
          >
            <div className="flex items-center justify-between gap-2 text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 transition-colors">
              <span>{locale.buttons.logout ?? 'Logout'}</span>
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
