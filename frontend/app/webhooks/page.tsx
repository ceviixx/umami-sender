// 📄 app/webhooks/page.tsx
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
import ContextMenu from '@/components/ContextMenu'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function WebhooksPage() {
  const router = useRouter()
  const { locale } = useI18n()
  const [webhooks, setWebhooks] = useState<WebhookRecipient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWebhooks()
      .then(setWebhooks)
      .finally(() => setLoading(false))
  }, [])

  const [deleteId, setDeleteId] = useState<number | null>(null)
  const handleDelete = async () => {
    if (deleteId !== null) {
      await deleteWebhook(deleteId)
      setDeleteId(null)
      setWebhooks(prev => prev.filter(w => w.id !== deleteId))
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader
        title={locale.pages.webhook}
        href='/webhooks/new'
      />

      {loading && <LoadingSpinner />}

      {webhooks.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-3">
          {webhooks.map(w => (
            <li key={w.id} className="border rounded p-3 flex justify-between bg-white">
              <div>
                <div className="font-semibold">{w.name}</div>
                <div className="text-sm text-gray-600">{w.type}</div>
              </div>

              <ContextMenu
                  onEdit={() => router.push(`/webhooks/${w.id}`)}
                  onDelete={() => setDeleteId(w.id)}
                />
            </li>
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