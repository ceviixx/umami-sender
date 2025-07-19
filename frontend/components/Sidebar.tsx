'use client'

import { useI18n } from "@/locales/I18nContext";
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { 
  Squares2X2Icon,
  ChartBarIcon,
  BriefcaseIcon,
  PaperAirplaneIcon,
  PuzzlePieceIcon
} from '@heroicons/react/20/solid'

export default function Sidebar() {
  const pathname = usePathname()
  const { locale } = useI18n()

  const links = [
    { href: '/', label: locale.pages.dashboard, icon: <Squares2X2Icon className="text-primary-600 w-5 h-5" /> },
    { href: '/umami-config', label: locale.pages.umami, icon: <ChartBarIcon className="text-primary-600 w-5 h-5" /> },
    { href: '/jobs', label: locale.pages.jobs, icon: <BriefcaseIcon className="text-primary-600 w-5 h-5" /> },

    { href: '/senders', label: locale.pages.sender, icon: <PaperAirplaneIcon className="text-primary-600 w-5 h-5" /> },
    { href: '/webhooks', label: locale.pages.webhook, icon: <PuzzlePieceIcon className="text-primary-600 w-5 h-5" /> },
  ]

  return (
    <div className="flex flex-col h-screen">
      <aside className="w-64 bg-gray-50 border-r border-gray-200 shadow-sm flex flex-col flex-shrink-0 h-full">
        <nav className="flex flex-col gap-1 p-4">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                link.href === '/'
                  ? pathname === '/'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                  : pathname.startsWith(link.href)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
    </div>
  )
}