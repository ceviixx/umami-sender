import './globals.css'
import Sidebar from '@/components/Sidebar'
import { Toaster } from 'react-hot-toast'
import { I18nProvider } from "@/locales/I18nContext"
import LanguageSwitcher from "@/components/LanguageSwitcher"

export const metadata = {
  title: {
    default: 'UmamiSender',
    template: '%s | UmamiSender',
  },
  icons: {
    icon: '/favicon-32x32.png',
    shortcut: '/umamisender.png',
    apple: '/umamisender.png',
  },
  description: 'UmamiSender is a tool to send statistics per email or webhook from Umami cloud and self-hosted.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <html lang="en" className="h-full">
        <body className="h-full">
          <div className="flex flex-col h-screen">
            {/* Fixed Header */}
            <header className="fixed top-0 left-0 w-full h-16 bg-gray-50 border-b border-gray-200 z-20 flex items-center justify-between px-6 text-lg font-semibold text-blue-600 shadow-sm">
              <div className="flex items-center gap-2">
                <img
                  src="/umamisender.png"
                  alt="UmamiSender Logo"
                  className="h-5 w-5 mr-0 object-cover"
                />
                UmamiSender
              </div>
              <LanguageSwitcher />
            </header>
            <div className="flex flex-1 pt-16">
              <aside className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-gray-50 border-r border-gray-200 shadow-sm z-10 flex flex-col">
                <Sidebar />
              </aside>
              <main className="ml-64 flex-1 overflow-y-auto p-6 bg-white-50">
                {children}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#fff',
                      color: '#333',
                      border: '1px solid #ddd',
                      padding: '12px 16px',
                    },
                    success: {
                      iconTheme: {
                        primary: '#10b981',
                        secondary: '#ecfdf5',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fee2e2',
                      },
                    },
                    removeDelay: 500,
                  }}
                  containerStyle={{ 
                    zIndex: 9999,
                    marginTop: '0px',
                  }}
                  reverseOrder={false}
                  gutter={8}
                />
              </main>
            </div>
          </div>
        </body>
      </html>
    </I18nProvider>
  );
}
