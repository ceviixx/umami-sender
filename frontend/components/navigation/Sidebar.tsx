'use client'

import { useI18n } from "@/locales/I18nContext";
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import packageJson from '../../package.json'

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
  /** optional: eigene Matching-Regeln, z.B. '/umami' und /^\/umami\// */
  match?: (string | RegExp)[]
}

export default function Sidebar() {
  const pathname = usePathname()
  const { locale } = useI18n()

  const menus: Record<'app' | 'account', SidebarLink[]> = {
    app: [
      {
        href: '/',
        label: locale.pages.dashboard,
        icon: <Squares2X2Icon className="w-5 h-5" />,
        match: ['/', /^\/$/]
      },
      {
        href: '/umami',
        label: locale.pages.umami,
        icon: <ChartBarIcon className="w-5 h-5" />,
        match: ['/umami', /^\/umami\//]
      },
      {
        href: '/jobs',
        label: locale.pages.jobs,
        icon: <BriefcaseIcon className="w-5 h-5" />,
        match: ['/jobs', /^\/jobs\//]
      },
      {
        href: '/mailers',
        label: locale.pages.mailer,
        icon: <PaperAirplaneIcon className="w-5 h-5" />,
        match: ['/mailers', /^\/mailers\//]
      },
      {
        href: '/webhooks',
        label: locale.pages.webhook,
        icon: <PuzzlePieceIcon className="w-5 h-5" />,
        match: ['/webhooks', /^\/webhooks\//]
      },
      {
        href: '/templates',
        label: locale.pages.templates,
        icon: <DocumentIcon className="w-5 h-5" />,
        match: ['/templates', /^\/templates\//]
      },
    ],
    account: [
      {
        href: '/account',
        label: locale.pages.account,
        icon: <UserIcon className="w-5 h-5" />,
        match: [/^\/account$/],
      },
      {
        href: '/account/password',
        label: locale.pages.changepassword,
        icon: <KeyIcon className="w-5 h-5" />,
        match: ['/account/password']
      },
      { label: locale.pages.systemSection },
      {
        href: '/account/system/logs',
        label: locale.pages.admin.logs,
        icon: <ListBulletIcon className="w-5 h-5" />,
        match: ['/account/system/logs']
      },
      { label: locale.pages.adminSection },
      {
        href: '/account/admin/users',
        label: locale.pages.admin.users,
        icon: <UsersIcon className="w-5 h-5" />,
        match: ['/account/admin/users', /^\/account\/admin\/users\//]
      },
      {
        href: '/account/admin/templates',
        label: locale.pages.template_update,
        icon: <DocumentIcon className="w-5 h-5" />,
        match: ['/account/admin/templates']
      },
    ],
  }

  const currentArea: 'app' | 'account' = pathname.startsWith('/account') ? 'account' : 'app'
  const menuItems = menus[currentArea]

  const isLinkActive = (link: SidebarLink) => {
    if (!link.href) return false
    if (link.match && link.match.length) {
      return link.match.some((pattern) =>
        typeof pattern === 'string'
          ? pathname === pattern || pathname.startsWith(pattern + '/')
          : pattern.test(pathname)
      )
    }
    // Fallback: href als Basis
    return pathname === link.href || pathname.startsWith(link.href + '/')
  }

  return (
    <aside
      className="w-64 h-full flex flex-col
                 bg-white/70 dark:bg-gray-900/40 backdrop-blur-sm
                 border-r border-gray-200/70 dark:border-gray-800/60 shadow-sm"
    >
      {currentArea === 'account' && (
        <div className="h-16 flex items-center px-4 border-b border-gray-200/70 dark:border-gray-800/60">
          <Link
            href="/"
            className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
          >
            <ChevronLeftIcon className="w-4 h-4 mr-1" />
            {locale.ui.back_to_app}
          </Link>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {menuItems.map((link, i) => {
            if (!link.href) {
              return (
                <li
                  key={`section-${i}`}
                  className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider
                             text-gray-500 dark:text-gray-400"
                >
                  {link.label}
                </li>
              )
            }

            const active = isLinkActive(link)

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    "group relative flex items-center gap-3 rounded-lg mx-2 px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-gray-100/90 text-gray-900 dark:bg-gray-800/70 dark:text-gray-100"
                      : "text-gray-700 hover:bg-gray-100/70 dark:text-gray-200 dark:hover:bg-gray-800/60",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
                  ].join(" ")}
                >
                  <span
                    className={[
                      "absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r",
                      active
                        ? "bg-gray-900 dark:bg-gray-100"
                        : "bg-transparent group-hover:bg-gray-400/60 dark:group-hover:bg-gray-500/60"
                    ].join(" ")}
                    aria-hidden
                  />

                  <span
                    className={[
                      "inline-flex items-center justify-center rounded-md w-7 h-7",
                      active
                        ? "bg-gray-200/80 text-gray-900 dark:bg-gray-700/70 dark:text-gray-100"
                        : "bg-gray-100/60 text-gray-600 dark:bg-gray-800/60 dark:text-gray-400"
                    ].join(" ")}
                  >
                    {link.icon}
                  </span>

                  <span className="truncate">{link.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="px-4 py-3 border-top border-gray-200/70 dark:border-gray-800/60 text-xs text-gray-500 dark:text-gray-400">
        Version {packageJson.version}
      </div>
    </aside>
  )
}
