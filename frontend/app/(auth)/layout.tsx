import '../globals.css'

import { I18nProvider } from "@/locales/I18nContext"
import { UmamiSender } from '@/components/icons/UmamiSender'

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

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <html lang="en">
        <body className="h-full bg-white text-black dark:bg-gray-900 dark:text-white">
          <div className="flex flex-col h-screen">
            <header className="fixed top-0 left-0 w-full h-16 z-20 flex items-center justify-between px-6 text-lg font-semibold text-black-600 dark:text-white-400">
              <div className="flex items-center gap-2">
                <UmamiSender className='h-5 w-5' />
              </div>
            </header>
            {children}
          </div>
        </body>
      </html>
    </I18nProvider>
  )
}
