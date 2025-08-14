'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/locales/I18nContext'
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

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
    <div className="relative h-6 w-6" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        title={locale.buttons.account}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={locale.buttons.account}
        className={clsx(
          'group/button inline-flex h-6 w-6 items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition',
          open && 'text-black dark:text-white bg-gray-100 dark:bg-gray-700'
        )}
      >
        <UserCircleIcon
          className={clsx(
            'h-6 w-6 transition-transform duration-200 group-hover/button:scale-110',
            open && 'scale-110'
          )}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-md ring-1 ring-black/5 dark:ring-white/10 z-50 py-1 text-sm"
          role="menu"
        >
          <button
            onClick={handleProfile}
            className="w-full text-left px-4 py-2 flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {locale.pages.account}
          </button>

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 flex items-center justify-between gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 transition-colors font-semibold"
          >
            <span>{locale.buttons.logout}</span>
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}
