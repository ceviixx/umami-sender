import '../globals.css'
import Sidebar from '@/components/navigation/Sidebar'
import { Toaster } from 'react-hot-toast'
import { I18nProvider } from "@/locales/I18nContext"
import UserMenu from '@/components/navigation/UserMenu'
import ClientAuthGuard from '@/components/ClientAuthGuard'
import InactivityLogout from '@/components/InactivityLogout'
import { GitHubMark } from "@/components/icons/GitHubMark";
import { UmamiSender } from '@/components/icons/UmamiSender'

export const metadata = {
  title: {
    default: 'UmamiSender',
    template: '%s | UmamiSender',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/umamisender.png',
    apple: '/umamisender.png',
  },
  description: 'UmamiSender is a tool to send statistics per email or webhook from Umami cloud and self-hosted.',
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <html lang="en" className="h-full">
        <body className="h-full bg-white text-black dark:bg-gray-900 dark:text-white antialiased">
          <ClientAuthGuard>
            <InactivityLogout />

            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] rounded-lg bg-white/90 dark:bg-gray-900/90 px-3 py-2 text-sm shadow border border-gray-200/70 dark:border-gray-800/60"
            >
              Skip to content
            </a>

            <div className="flex flex-col h-screen isolate">
              <header className="fixed top-0 left-0 w-full h-16
                                 bg-white/70 dark:bg-gray-900/40 backdrop-blur-sm
                                 border-b border-gray-200/70 dark:border-gray-800/60
                                 z-40 flex items-center justify-between px-6
                                 text-sm font-medium">
                <div className="flex items-center gap-2">
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

              <div className="flex flex-1 pt-16">
                <aside className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)]
                                   bg-white/70 dark:bg-gray-900/40 backdrop-blur-sm
                                   shadow-sm z-30 flex flex-col">
                  <Sidebar />
                </aside>

                <main
                  id="main"
                  className="ml-64 flex-1 overflow-y-auto p-6
                             bg-white dark:bg-gray-900"
                >
                  {children}

                  <Toaster
                    position="top-center"
                    reverseOrder={false}
                    gutter={8}
                    toastOptions={{
                      duration: 4000,
                      style: {
                        borderRadius: '12px',
                        border: '1px solid rgba(229,231,235,.7)',
                        background: 'rgba(255,255,255,.95)',
                        color: '#111827',
                        padding: '12px 16px',
                        boxShadow:
                          '0 10px 15px -3px rgba(0,0,0,.05), 0 4px 6px -2px rgba(0,0,0,.03)',
                      },
                      success: {
                        iconTheme: { primary: '#10b981', secondary: '#ecfdf5' },
                      },
                      error: {
                        iconTheme: { primary: '#ef4444', secondary: '#fee2e2' },
                      },
                    }}
                    containerStyle={{
                      zIndex: 60,
                      marginTop: '-6px',
                    }}
                  />
                </main>
              </div>
            </div>
          </ClientAuthGuard>
        </body>
      </html>
    </I18nProvider>
  );
}
