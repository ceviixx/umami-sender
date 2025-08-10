import PageHeader from '@/components/PageHeader'
import { useRouter } from 'next/navigation'
import {
  ArrowPathIcon
} from '@heroicons/react/20/solid'

type NetworkErrorProps = {
  page: string
  title?: string
  message?: string
  retryPath?: string
}

export default function NetworkError({
  page = '',
  title = 'Network Error',
  message = '',
  retryPath,
}: NetworkErrorProps) {
  const router = useRouter()

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader title={page} />

      <div className="flex flex-col items-center justify-center text-center text-gray-600 pt-40 px-4">
        <div className="space-y-4">
          <p className="text-xl font-semibold">{title}</p>
          <p className="text-base">{message}</p>

          <div>
            <button
              onClick={() => {
                if (retryPath) {
                  router.replace(retryPath)
                } else {
                  location.reload()
                }
              }}
              className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
            >
              <ArrowPathIcon className="mr-2 h-5 w-5" />
              Erneut versuchen
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
