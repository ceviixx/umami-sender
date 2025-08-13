'use client'

import { useI18n } from "@/locales/I18nContext";
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchWebhooks, deleteWebhook } from '@/lib/api/webhook'
import { WebhookRecipient } from '@/types'
import ConfirmDelete from '@/components/ConfirmDelete'
import EmptyState from '@/components/EmptyState'
import NetworkError from "@/components/NetworkError";
import ContextMenu from '@/components/ContextMenu'
import PageHeader from '@/components/navigation/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import CardList from "@/components/cardlist/CardList";
import { showError } from "@/lib/toast";

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
        .then(() => {
          setWebhooks(prev => prev.filter(w => w.id !== deleteId))
        })
        .catch((error) => {
          showError(error.message)
        })
        .finally(() => {
          setDeleteId(null)
        })
    }
  }

  if (loading) { return <LoadingSpinner title={locale.pages.webhook} /> }
  if (networkError) { return <NetworkError page={locale.pages.jobs} message={networkError} /> }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <PageHeader
        title={locale.pages.webhook}
        href='/webhooks/new'
      />

      {webhooks.length === 0 ? (
        <EmptyState />
      ) : (
        <CardList
          items={webhooks}
          keyField={(item) => item.id}
          title={(item) => item.name}
          subtitle={(item) => item.type}
          rightSlot={(item) => (
            <ContextMenu
              items={[
                {
                  title: locale.buttons.edit,
                  action: () => router.push(`/webhooks/${item.id}`),
                  tone: 'default',
                },
                {
                  title: locale.buttons.delete,
                  action: () => setDeleteId(item.id),
                  tone: 'danger',
                },
              ]}
            />
          )}
        />
      )}
      <ConfirmDelete
        open={deleteId !== null}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}