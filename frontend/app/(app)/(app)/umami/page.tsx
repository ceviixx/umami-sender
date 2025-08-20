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
import { showError } from "@/lib/toast";
import Container from "@/components/layout/Container";

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
        .then(() => {
          setInstances(prev => prev.filter(w => w.id !== deleteId))
        })
        .catch((error) => {
          showError(error.message)
        })
        .finally(() => {
          setDeleteId(null)
        })
    }
  }

  if (loading) { return <LoadingSpinner title={locale.pages.umami} /> }
  if (networkError) { return <NetworkError page={locale.pages.jobs} message={networkError} /> }

  return (
    <Container>
      <PageHeader
        title={locale.pages.umami}
        href='/umami/new'
      />

      {instances.length === 0 ? (
        <EmptyState 
          variant='chip' 
          hint="Connect your first umami with the + in the top right." 
          rows={4}
        />
      ) : (
        <CardList
          items={instances}
          keyField={(item) => item.id}
          title={(item) => item.name}
          subtitle={(item) => locale.enums.service_type[item.type]}
          badge={(item) => item.is_healthy ? locale.common.healthy : locale.common.unhealthy}
          badgeTone={(item) => item.is_healthy ? 'success' : 'warning'}
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
    </Container>
  )
}