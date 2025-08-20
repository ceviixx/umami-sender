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
import { useWebhookType } from "@/lib/constants";
import Container from "@/components/layout/Container";

export default function WebhooksPage() {
  const router = useRouter()
  const { locale } = useI18n()
  const [webhooks, setWebhooks] = useState<WebhookRecipient[]>([])
  const [loading, setLoading] = useState(true)
  const [networkError, setHasNetworkError] = useState<string | null>(null)
  const { getLabel } = useWebhookType()

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
    <Container>
      <PageHeader
        title={locale.pages.webhook}
        href='/webhooks/new'
      />

      {webhooks.length === 0 ? (
        <EmptyState 
          variant='chip' 
          hint="Create your first webhook recipient with the + in the top right." 
          rows={4}
        />
      ) : (
        <CardList
          items={webhooks}
          keyField={(item) => item.id}
          title={(item) => item.name}
          subtitle={(item) => getLabel(item.type)}
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
    </Container>
  )
}