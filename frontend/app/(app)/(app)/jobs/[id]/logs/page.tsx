'use client'

import { useI18n } from '@/locales/I18nContext'
import PageHeader from '@/components/PageHeader'
import { useEffect, useState } from 'react'
import { LogItem } from '@/types'
import EmptyState from '@/components/EmptyState'
import {
  fetchJobLogs,
} from '@/lib/api/logs'
import CardItem from "@/components/CardItem";
import LoadingSpinner from '@/components/LoadingSpinner'

export default function Job_System_Logs({ params }: { params: { id: string } }) {
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
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader
        hasBack={true}
        title={locale.pages.logs}
      />


      {logs.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-3">
          {logs.map(log => (
            <CardItem key={log.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3 font-semibold">
                  <span className="text-sm">{log.name}</span>
                </div>

                <span className="text-xs text-gray-400">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500 italic">{log.channel}</div>
                <div
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${log.status === 'success'
                    ? 'bg-green-100 text-green-800'
                    : log.status === 'skipped'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                    }`}
                >
                  {log.status.toUpperCase()}
                </div>
              </div>

              {log.error && log.status === 'skipped' && (
                <div className="mt-2 text-xs text-yellow-800 bg-yellow-50 border border-yellow-200 rounded p-2 whitespace-pre-wrap">
                  {log.error}
                </div>
              )}

              {log.error && log.status === 'failed' && (
                <div className="mt-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2 whitespace-pre-wrap">
                  {log.error}
                </div>
              )}
            </CardItem>
          ))}
        </ul>
      )}


    </div>
  )
}
