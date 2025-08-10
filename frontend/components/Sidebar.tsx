'use client'

import { useI18n } from "@/locales/I18nContext";
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import packageJson from '../package.json'

import {
  Squares2X2Icon,
  ChartBarIcon,
  BriefcaseIcon,
  PaperAirplaneIcon,
  PuzzlePieceIcon,
  DocumentIcon,
  ChevronLeftIcon,
  UserIcon,
  KeyIcon,
  UsersIcon,
  ListBulletIcon
} from '@heroicons/react/20/solid'

type SidebarLink = {
  href?: string
  label: string
  icon?: React.ReactNode
}


export default function Sidebar() {
  const pathname = usePathname()
  const { locale } = useI18n()

  const menus: Record<'app' | 'account', SidebarLink[]> = {
    app: [
      { href: '/', label: locale.pages.dashboard, icon: <Squares2X2Icon className="text-primary-600 w-5 h-5" /> },
      { href: '/umami', label: locale.pages.umami, icon: <ChartBarIcon className="text-primary-600 w-5 h-5" /> },
      { href: '/jobs', label: locale.pages.jobs, icon: <BriefcaseIcon className="text-primary-600 w-5 h-5" /> },

      { href: '/mailers', label: locale.pages.mailer, icon: <PaperAirplaneIcon className="text-primary-600 w-5 h-5" /> },
      { href: '/webhooks', label: locale.pages.webhook, icon: <PuzzlePieceIcon className="text-primary-600 w-5 h-5" /> },

      { href: '/templates', label: locale.pages.templates, icon: <DocumentIcon className="text-primary-600 w-5 h-5" /> },
    ],
    account: [
      { href: '/account', label: locale.pages.account, icon: <UserIcon className="text-primary-600 w-5 h-5" /> },
      { href: '/account/password', label: locale.pages.changepassword, icon: <KeyIcon className="text-primary-600 w-5 h-5" /> },

      { label: '{system}' },
      { href: '/account/system/logs', label: locale.pages.admin.logs, icon: <ListBulletIcon className="text-primary-600 w-5 h-5" /> },

      { label: locale.pages.adminSection },
      { href: '/account/admin/users', label: locale.pages.admin.users, icon: <UsersIcon className="text-primary-600 w-5 h-5" /> },
    ],
  }

  const currentArea = pathname.startsWith('/account') ? 'account' : 'app'
  const menuItems = menus[currentArea as keyof typeof menus] || []

  return (
    <div className="flex flex-col h-full justify-between">
      <aside className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm flex flex-col flex-shrink-0 h-full">
        <nav className="flex flex-col flex-1 justify-between p-4 text-sm text-gray-700 dark:text-gray-200">
          <div className="space-y-2">
            {currentArea === 'account' && (
              <div className="px-2 pb-3">
                <Link
                  href="/"
                  className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  <ChevronLeftIcon className="w-4 h-4 mr-1" />
                  {locale.ui.back_to_app}
                </Link>
              </div>
            )}

            {menuItems.map((link, index) => {
              if (!link.href) {
                return (
                  <div
                    key={`section-${index}`}
                    className="text-xs font-semibold px-4 pt-4 pb-1 text-gray-500 dark:text-gray-400 uppercase"
                  >
                    {link.label}
                  </div>
                )
              }

              const isActive = pathname === link.href

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                      ? 'bg-gray-200 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  {link.icon ?? <Squares2X2Icon className="text-primary-600 w-5 h-5" />}
                  {link.label}
                </Link>
              )
            })}
          </div>

          <div className="text-gray-400 dark:text-gray-500 text-xs text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            Version {packageJson.version}
          </div>
        </nav>
      </aside>
    </div>
  )

}