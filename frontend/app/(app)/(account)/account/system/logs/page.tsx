'use client'

import { useI18n } from '@/locales/I18nContext'
import PageHeader from '@/components/navigation/PageHeader'
import { useEffect, useState } from 'react'
import { LogItem } from '@/types'
import EmptyState from '@/components/EmptyState'
import { fetchLogs } from '@/lib/api/logs'
import CardList from '@/components/cardlist/CardList'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function LogsPage() {
  const [logs, setLogs] = useState<LogItem[]>([])
  const [loading, setLoading] = useState(true)
  const { locale } = useI18n()

  useEffect(() => {
    fetchLogs()
      .then(setLogs)
      .finally(() => setLoading(false))
  }, [])

  
  if (loading) { return <LoadingSpinner title={locale.pages.logs} /> }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <PageHeader title={locale.pages.logs} />

      {logs.length === 0 ? (
        <EmptyState />
      ) : (
        <CardList
          items={logs}
          keyField={(item) => item.id}
          title={(item) => item.name}
          subtitle={(item) => item.error}
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
      )}
    </div>
  )
}
