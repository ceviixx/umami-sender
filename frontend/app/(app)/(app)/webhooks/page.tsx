'use client'

import { useI18n } from "@/locales/I18nContext";
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  fetchWebhooks,
  deleteWebhook
} from '@/lib/api/webhook'
import { WebhookRecipient } from '@/types'
import ConfirmDelete from '@/components/ConfirmDelete'
import EmptyState from '@/components/EmptyState'
import NetworkError from "@/components/NetworkError";
import ContextMenu from '@/components/ContextMenu'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import CardItem from "@/components/CardItem";

export default function WebhooksPage() {
  const router = useRouter()
  const { locale } = useI18n()
  const [webhooks, setWebhooks] = useState<WebhookRecipient[]>([])
  const [loading, setLoading] = useState(true)
  const [networkError, setHasNetworkError] = useState<string | null>(null)

  useEffect(() => {
    fetchWebhooks()
      .then(setWebhooks)
      .catch((error) => {
        setHasNetworkError(error.message)
      })
      .finally(() => setLoading(false))
  }, [])

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const handleDelete = async () => {
    if (deleteId !== null) {
      await deleteWebhook(deleteId)
      setDeleteId(null)
      setWebhooks(prev => prev.filter(w => w.id !== deleteId))
    }
  }

  if (loading) { return <LoadingSpinner title={locale.pages.webhook} /> }
  if (networkError) { return <NetworkError page={locale.pages.jobs} message={networkError} /> }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader
        title={locale.pages.webhook}
        href='/webhooks/new'
      />

      {webhooks.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-3">
          {webhooks.map(w => (
            <CardItem
              key={w.id}
              rightSlot={
                <ContextMenu
                  items={[
                    {
                      title: locale.buttons.edit,
                      action: () => router.push(`/webhooks/${w.id}`),
                      tone: 'default',
                    },
                    {
                      title: locale.buttons.delete,
                      action: () => setDeleteId(w.id),
                      tone: 'danger',
                    },
                  ]}
                />
              }
            >
              <div>
                <div className="font-semibold">{w.name}</div>
                <div className="text-sm text-gray-600">{w.type}</div>
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