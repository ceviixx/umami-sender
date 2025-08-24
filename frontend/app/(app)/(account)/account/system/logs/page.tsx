'use client'

import { useI18n } from '@/locales/I18nContext'
import PageHeader from '@/components/navigation/PageHeader'
import { useEffect, useState } from 'react'
import { JobLog } from '@/types'
import EmptyState from '@/components/EmptyState'
import { fetchLogs } from '@/lib/api/logs'
import CardList from '@/components/cardlist/CardList'
import LoadingSpinner from '@/components/LoadingSpinner'
import Container from '@/components/layout/Container'

export default function LogsPage() {
  const [logs, setLogs] = useState<JobLog[]>([])
  const [loading, setLoading] = useState(true)
  const { locale } = useI18n()

  useEffect(() => {
    fetchLogs()
      .then(setLogs)
      .finally(() => setLoading(false))
  }, [])


  if (loading) { return <LoadingSpinner title={locale.pages.logs} /> }

  return (
    <Container>
      <PageHeader title={locale.pages.logs} />

      {logs.length === 0 ? (
        <EmptyState
          variant='chip'
          hint="There currently no logs to display"
          rows={4}
        />
      ) : (
        <CardList
          items={logs}
          keyField={(item) => item.log_id}
          title={(item) => item.job_name}
          badge={(item) => item.status}
          badgeTone={(item) => item.status}
          rightSlot={(item) => (
            <span className="text-xs text-gray-400">
              {new Date(String(item.started_at).replace(/(\.\d{3})\d+$/, "$1")).toLocaleString(locale.lang_code, {
                dateStyle: "medium",
                timeStyle: "short",
                hour12: false,
              })} - {item.duration_ms}ms
            </span>
          )}
          bottomSlot={(item) =>
            <CardList
              items={item.details}
              keyField={(item) => item.channel}
              title={(item) => item.channel}
              subtitle={(item) => (
                <code className='text-xs'>{item.error}</code>
              )}
              badge={(item) => item.status}
              badgeTone={(item) => item.status}
            />
          }
        />
      )}
    </Container>
  )
}
