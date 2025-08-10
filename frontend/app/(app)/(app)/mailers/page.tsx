'use client'

import { useI18n } from "@/locales/I18nContext";
import { useEffect, useState } from 'react'
import {
  fetchMailers,
  deleteMailer

} from '@/lib/api/mailers'
import { Sender } from '@/types'
import ConfirmDelete from '@/components/ConfirmDelete'
import EmptyState from '@/components/EmptyState'
import NetworkError from "@/components/NetworkError";
import ContextMenu from '@/components/ContextMenu'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import CardItem from "@/components/CardItem";

import { useRouter } from 'next/navigation'

export default function SendersPage() {
  const [senders, setSenders] = useState<Sender[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { locale } = useI18n()
  const [networkError, setHasNetworkError] = useState<string | null>(null)

  useEffect(() => {
    fetchMailers()
      .then(setSenders)
      .catch((error) => {
        setHasNetworkError(error.message)
      })
      .finally(() => setLoading(false))
  }, [])

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const handleDelete = async () => {
    if (deleteId !== null) {
      await deleteMailer(deleteId)
      setDeleteId(null)
      setSenders(prev => prev.filter(w => w.id !== deleteId))
    }
  }

  if (loading) { return <LoadingSpinner title={locale.pages.mailer} /> }
  if (networkError) { return <NetworkError page={locale.pages.jobs} message={networkError} /> }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader
        title={locale.pages.mailer}
        href='/mailers/new'
      />

      {senders.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-3">
          {senders.map(mailer => (
            <CardItem
              key={mailer.id}
              rightSlot={
                <ContextMenu
                  items={[
                    {
                      title: locale.buttons.edit,
                      action: () => router.push(`/mailers/${mailer.id}`),
                      tone: 'default',
                    },
                    {
                      title: locale.buttons.delete,
                      action: () => setDeleteId(mailer.id),
                      tone: 'danger',
                    },
                  ]}
                />
              }
            >
              <div>
                <div className="font-semibold">{mailer.name}</div>
                <div className="text-gray-600 text-sm">{mailer.email}</div>
              </div>
            </CardItem>
          ))}
          <ConfirmDelete
            open={deleteId !== null}
            onConfirm={handleDelete}
            onCancel={() => setDeleteId(null)}
          />
        </ul>
      )}
    </div>
  )
}