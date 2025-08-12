'use client'

import { useI18n } from "@/locales/I18nContext";
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchUmamis, deleteUmami } from '@/lib/api/umami'
import { UmamiInstance } from '@/types'
import ConfirmDelete from '@/components/ConfirmDelete'
import EmptyState from '@/components/EmptyState'
import NetworkError from "@/components/NetworkError";
import ContextMenu from '@/components/ContextMenu'
import PageHeader from '@/components/navigation/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import CardList from "@/components/cardlist/CardList";

export default function HostsPage() {
  const [instances, setInstances] = useState<UmamiInstance[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { locale } = useI18n()
  const [networkError, setHasNetworkError] = useState<string | null>(null)

  useEffect(() => {
    fetchUmamis()
      .then(setInstances)
      .catch((error) => {
        setHasNetworkError(error.message)
      })
      .finally(() => setLoading(false))
  }, [])

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const handleDelete = async () => {
    if (deleteId !== null) {
      await deleteUmami(deleteId)
      setDeleteId(null)
      setInstances(prev => prev.filter(w => w.id !== deleteId))
    }
  }

  if (loading) { return <LoadingSpinner title={locale.pages.umami} /> }
  if (networkError) { return <NetworkError page={locale.pages.jobs} message={networkError} /> }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <PageHeader
        title={locale.pages.umami}
        href='/umami/new'
      />

      {instances.length === 0 ? (
        <EmptyState />
      ) : (
        <CardList
          items={instances}
          keyField={(item) => item.id}
          title={(item) => item.id}
          subtitle={(item) => item.type }
          rightSlot={(item) => (
            <ContextMenu
              items={[
                {
                  title: locale.buttons.edit,
                  action: () => router.push(`/umami/${item.id}`),
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