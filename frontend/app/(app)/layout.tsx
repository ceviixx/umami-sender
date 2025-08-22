'use client'

import '../globals.css'
import Sidebar from '@/components/navigation/Sidebar'

import { Toaster } from 'react-notification-kit';

import { I18nProvider } from "@/locales/I18nContext"
import UserMenu from '@/components/navigation/UserMenu'
import ClientAuthGuard from '@/components/ClientAuthGuard'
import InactivityLogout from '@/components/InactivityLogout'
import { GitHubMark } from "@/components/icons/GitHubMark";
import { UmamiSender } from '@/components/icons/UmamiSender'
import { SessionProvider } from '@/lib/session/SessionContext';
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => { setNavOpen(false) }, [pathname])

  return (
    <I18nProvider>
      <SessionProvider>
        <html lang="en" className="h-full">
          <body className="h-full bg-white text-black dark:bg-gray-900 dark:text-white antialiased">
            <ClientAuthGuard>
              <InactivityLogout />

              <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:top-[max(theme(spacing.2),env(safe-area-inset-top))] focus:left-2 focus:z-[100] rounded-lg bg-white/90 dark:bg-gray-900/90 px-3 py-2 text-sm shadow border border-gray-200/70 dark:border-gray-800/60"
              >
                Skip to content
              </a>

              <div className="flex flex-col h-dvh">
                <header
                  className="fixed top-0 inset-x-0 h-14
                             bg-white/70 dark:bg-gray-900/40 backdrop-blur supports-[backdrop-filter]:backdrop-blur-sm
                             border-b border-gray-200/70 dark:border-gray-800/60
                             z-40 flex items-center justify-between px-4 sm:px-6
                             text-sm font-medium"
                  style={{ paddingTop: 'env(safe-area-inset-top)' }}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="inline-flex md:hidden items-center justify-center rounded-lg p-2
                                 hover:bg-gray-100/70 dark:hover:bg-gray-800/60
                                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      aria-label="Open navigation"
                      aria-controls="primary-navigation"
                      aria-expanded={navOpen}
                      onClick={() => setNavOpen(true)}
                    >
                      <Bars3Icon className="h-5 w-5" />
                    </button>

                    <UmamiSender className="h-5 w-5" />
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href="https://github.com/ceviixx/umami-sender"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full px-2 py-1
                                 text-gray-900 dark:text-gray-100
                                 hover:bg-gray-100/70 dark:hover:bg-gray-800/60
                                 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      aria-label="GitHub Repository"
                      title="GitHub Repository"
                    >
                      <GitHubMark className="h-5 w-5" />
                    </a>
                    <UserMenu />
                  </div>
                </header>

                <div className="flex flex-1 pt-14">
                  <aside
                    className="hidden md:flex md:fixed md:top-14 md:left-0 md:w-64 md:h-[calc(100dvh-3.5rem)]
                               bg-white/70 dark:bg-gray-900/40 backdrop-blur supports-[backdrop-filter]:backdrop-blur-sm
                               border-r border-gray-200/70 dark:border-gray-800/60 z-30"
                    aria-label="Primary"
                  >
                    <Sidebar />
                  </aside>

                  <div
                    className={`md:hidden fixed inset-0 z-50 ${navOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
                    aria-hidden={!navOpen}
                  >
                    <div
                      className={`absolute inset-0 bg-black/40 transition-opacity ${navOpen ? 'opacity-100' : 'opacity-0'}`}
                      onClick={() => setNavOpen(false)}
                    />
                    
                    <nav id="primary-navigation" className={`absolute top-0 left-0 h-full w-80 max-w-[85%] bg-white dark:bg-gray-900 shadow-xl transition-transform duration-200 ease-out ${navOpen ? 'translate-x-0' : '-translate-x-full'}`} role="dialog" aria-modal="true">
                      <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200/70 dark:border-gray-800/60">
                        <div className="flex items-center gap-2">
                          <UmamiSender className="h-5 w-5" />
                          <span className="text-sm font-semibold">Menu</span>
                        </div>
                        <button
                          type="button"
                          className="rounded-lg p-2 hover:bg-gray-100/70 dark:hover:bg-gray-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                          aria-label="Close navigation"
                          onClick={() => setNavOpen(false)}
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="h-[calc(100dvh-3.5rem)] overflow-y-auto">
                        <Sidebar />
                      </div>
                    </nav>
                  </div>

                  <main id="main" className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 px-4 sm:px-6 py-4 sm:py-6 md:ml-64" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
                    {children}

                    <Toaster position="top-right" defaultDuration={2000} maxVisible={3} />
                  </main>
                </div>
              </div>
            </ClientAuthGuard>
          </body>
        </html>
      </SessionProvider>
    </I18nProvider>
  );
}
