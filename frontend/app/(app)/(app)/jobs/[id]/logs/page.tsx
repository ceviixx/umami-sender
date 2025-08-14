'use client'

import { useI18n } from '@/locales/I18nContext'
import PageHeader from '@/components/navigation/PageHeader'
import { useEffect, useState } from 'react'
import { LogItem } from '@/types'
import EmptyState from '@/components/EmptyState'
import { fetchJobLogs } from '@/lib/api/logs'
import LoadingSpinner from '@/components/LoadingSpinner'
import CardList from '@/components/cardlist/CardList'

export default function JobLogsPage({ params }: { params: { id: string } }) {
  const [logs, setLogs] = useState<LogItem[]>([])
  const [loading, setLoading] = useState(true)
  const { locale } = useI18n()

  useEffect(() => {
    fetchJobLogs(params.id)
      .then(setLogs)
      .finally(() => setLoading(false))
  }, [params.id])


  if (loading) { <LoadingSpinner title={locale.pages.logs} /> }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <PageHeader
        hasBack={true}
        title={locale.pages.logs}
      />

      {logs.length === 0 ? (
        <EmptyState />
      ) : (
        <CardList
          items={logs}
          keyField={(item) => item.id}
          title={(item) => item.name}
          badge={(item) => item.status}
          badgeTone={(item) => item.status}
          rightSlot={(item) => (
            <>
              <span className="text-xs text-gray-400">
                run:{item.run}
              </span>
            </>
          )}
          bottomSlot={(item) => 
            <CardList 
              items={item.details}
              keyField={(item) => item.timestamp}
              title={(item) => item.channel}
              subtitle={(item) => (
                <code className='text-xs'>{item.error}</code>
              )}
              badge={(item) => item.status}
              badgeTone={(item) => item.status}
              rightSlot={(item) => (
                <>
                  <span className="text-xs text-gray-400">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </>
              )}
            />
          }
        />
      )}
    </div>
  )
}
