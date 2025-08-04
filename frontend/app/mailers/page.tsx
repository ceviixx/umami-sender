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
import ContextMenu from '@/components/ContextMenu'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'

import { useRouter } from 'next/navigation'

export default function SendersPage() {
  const [senders, setSenders] = useState<Sender[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { locale } = useI18n()

  useEffect(() => {
    fetchMailers()
      .then(setSenders)
      .finally(() => setLoading(false))
  }, [])

  const [deleteId, setDeleteId] = useState<number | null>(null)
  const handleDelete = async () => {
    if (deleteId !== null) {
      await deleteMailer(deleteId)
      setDeleteId(null)
      setSenders(prev => prev.filter(w => w.id !== deleteId))
    }
  }

  if (loading) { return <LoadingSpinner title={locale.pages.mailer} /> }

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
          {senders.map(sender => (
            <li key={sender.id} className="border rounded p-3 flex justify-between bg-white">
              <div>
                <div className="font-semibold">{sender.name}</div>
                <div className="text-gray-600 text-sm">{sender.email}</div>
              </div>

              <ContextMenu
                onEdit={() => router.push(`/mailers/${sender.id}`)}
                onDelete={() => setDeleteId(sender.id)}
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