import '../globals.css'
import Sidebar from '@/components/Sidebar'
import { Toaster } from 'react-hot-toast'
import { I18nProvider } from "@/locales/I18nContext"
import UserMenu from '@/components/UserMenu'
import ClientAuthGuard from '@/components/ClientAuthGuard'
import InactivityLogout from '@/components/InactivityLogout'

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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <html lang="en" className="h-full">
        <body className="h-full bg-white text-black dark:bg-gray-900 dark:text-white">
          <ClientAuthGuard>
            <InactivityLogout />
            <div className="flex flex-col h-screen">
              <header className="fixed top-0 left-0 w-full h-16 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-20 flex items-center justify-between px-6 text-lg font-semibold text-black-600 dark:text-white-400 shadow-sm">
                <div className="flex items-center gap-2">
                  <svg width="25px" height="25px" viewBox="0 0 180 180" version="1.1" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black dark:text-white">
                    <title>umamisender</title>
                    <g id="umamisender" stroke="none" stroke-width="1" fill="currentColor" fill-rule="evenodd" fill-opacity="0.85">
                      <path d="M107.406209,180 C113.933537,180 118.878556,174.263813 122.043377,165.560284 L177.427634,21.1647466 C179.009538,16.6154968 180,12.8572007 180,9.69237313 C180,3.56040573 176.439197,0 170.306028,0 C167.142221,0 163.38292,0.989046602 158.833681,2.57156168 L13.4506389,58.3515215 C6.1319536,60.9230832 0,65.8681136 0,72.5933469 C0,81.2964709 6.52753084,84.0657204 15.0329479,86.6372821 L58.5492801,99.6921706 C64.878921,101.670061 68.0437415,101.867952 71.9997164,97.9119677 L166.153784,10.2858416 C167.340718,9.09890466 168.724124,9.49448279 169.714587,10.2858416 C170.899495,11.2746857 170.703023,12.6593104 169.714587,13.8462473 L82.4832222,108.593185 C78.9228245,112.351481 78.7249346,115.318418 80.5051335,121.845964 L93.1644154,163.779879 C95.9336586,172.878378 98.505012,180 107.406209,180 Z" id="Path" fill="currentColor" fill-rule="nonzero"></path>
                    </g>
                  </svg>
                  UmamiSender
                </div>
                <div className="flex items-center gap-4">
                  <UserMenu />
                </div>
              </header>

              <div className="flex flex-1 pt-16">
                <aside className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm z-10 flex flex-col">
                  <Sidebar />
                </aside>

                <main className="ml-64 flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-900">
                  {children}

                  <Toaster
                    position="top-center"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#ffffff',
                        color: '#333333',
                        border: '1px solid #dddddd',
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
                      marginTop: '-10px',
                    }}
                    reverseOrder={false}
                    gutter={8}
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
