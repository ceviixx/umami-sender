'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/locales/I18nContext'
import { UserCircleIcon, UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { useSession } from "@/lib/session/SessionContext";

export default function UserMenu() {
  const router = useRouter()
  const { locale } = useI18n()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { user, loading } = useSession()

  const handleLogout = () => {
    localStorage.clear()
    router.push('/login')
  }

  const handleProfile = () => {
    setOpen(false)
    router.push('/account')
  }

  useEffect(() => {
    const outside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', outside)
    return () => document.removeEventListener('mousedown', outside)
  }, [])

  return (
    <div className="relative h-6 w-6" ref={menuRef}>
      <button
        onClick={() => setOpen(v => !v)}
        title={locale.buttons.account}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={locale.buttons.account}
        className={clsx(
          'relative inline-flex h-6 w-6 items-center justify-center rounded-full',
          'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
        )}
      >
        <UserCircleIcon className="h-6 w-6" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-md border border-gray-200 dark:border-gray-700
                     bg-white dark:bg-gray-800 shadow-md z-50 py-1"
        >
          <div className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <span className="truncate">{loading ? '…' : user?.username ?? '—'}</span>
            {user?.role && (
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded
                               bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                {locale.enums.userrole[user.role as 'admin']}
              </span>
            )}
          </div>

          <div className="my-1 h-px bg-gray-100 dark:bg-gray-700" />

          <button
            onClick={handleProfile}
            className="w-full text-left px-3 py-2 text-sm text-gray-800 dark:text-gray-200
                       hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors flex items-center justify-between"
          >
            {locale.pages.account}
            <UserIcon className="h-5 w-5" />
          </button>

          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400
                       hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex items-center justify-between"
          >
            <span>{locale.buttons.logout}</span>
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}
