'use client'

import { useI18n } from "@/locales/I18nContext";
import { useEffect, useState } from 'react'
import { fetchMailers, deleteMailer } from '@/lib/api/mailers'
import { Sender } from '@/types'
import ConfirmDelete from '@/components/ConfirmDelete'
import EmptyState from '@/components/EmptyState'
import NetworkError from "@/components/NetworkError";
import ContextMenu from '@/components/ContextMenu'
import PageHeader from '@/components/navigation/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import CardList from "@/components/cardlist/CardList";
import { showError } from "@/lib/toast";
import { useRouter } from 'next/navigation'

export default function MailersPage() {
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
        .then(() => {
          setSenders(prev => prev.filter(w => w.id !== deleteId))
        })
        .catch((error) => {
          showError(error.message)
        })
        .finally(() => {
          setDeleteId(null)
        })
    }
  }

  if (loading) { return <LoadingSpinner title={locale.pages.mailer} /> }
  if (networkError) { return <NetworkError page={locale.pages.jobs} message={networkError} /> }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <PageHeader
        title={locale.pages.mailer}
        href='/mailers/new'
      />

      {senders.length === 0 ? (
        <EmptyState />
      ) : (
        <CardList
          items={senders}
          keyField={(item) => item.id}
          title={(item) => item.name}
          subtitle={(item) => item.email}
          rightSlot={(item) => (
            <ContextMenu
              items={[
                {
                  title: locale.buttons.edit,
                  action: () => router.push(`/mailers/${item.id}`),
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