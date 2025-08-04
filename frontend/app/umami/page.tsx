'use client'

import { useI18n } from "@/locales/I18nContext";
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  fetchUmamis, 
  deleteUmami 
} from '@/lib/api/umami'
import { UmamiInstance } from '@/types'
import ConfirmDelete from '@/components/ConfirmDelete'
import EmptyState from '@/components/EmptyState'
import ContextMenu from '@/components/ContextMenu'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function SettingsPage() {
  const [instances, setInstances] = useState<UmamiInstance[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { locale } = useI18n()

  useEffect(() => {
    fetchUmamis()
      .then(setInstances)
      .finally(() => setLoading(false))
  }, [])

  const [deleteId, setDeleteId] = useState<number | null>(null)
  const handleDelete = async () => {
    if (deleteId !== null) {
      await deleteUmami(deleteId)
      setDeleteId(null)
      setInstances(prev => prev.filter(w => w.id !== deleteId))
    }
  }

  if (loading) { return <LoadingSpinner title={locale.pages.umami} /> }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader
        title={locale.pages.umami}
        href='/umami/new'
      />

      {instances.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-3">
          {instances.map(instance => (
            <li key={instance.id} className="border rounded p-3 flex justify-between bg-white">
              <div>
                <div className="font-semibold">{instance.name}</div>
                <div className="text-sm text-gray-600">
                  {locale.enums.service_type[instance.type as 'cloud' | 'self_hosted'] || instance.type}
                </div>
              </div>

              <ContextMenu
                onEdit={() => router.push(`/umami/${instance.id}`)}
                onDelete={() => setDeleteId(instance.id)}
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