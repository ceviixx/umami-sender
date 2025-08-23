'use client'

import { useI18n } from "@/locales/I18nContext";
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchUsers, deleteUser } from '@/lib/api/users'
import { User } from '@/types'
import ConfirmDelete from '@/components/ConfirmDelete'
import EmptyState from '@/components/EmptyState'
import NetworkError from "@/components/NetworkError";
import ContextMenu from '@/components/ContextMenu'
import PageHeader from '@/components/navigation/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import CardList from "@/components/cardlist/CardList";
import Container from '@/components/layout/Container'
import { showError, notification_ids } from "@/lib/toast";

export default function UsersPage() {
  const router = useRouter()
  const { locale } = useI18n()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [networkError, setHasNetworkError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch((error) => {
        setHasNetworkError(error.message)
      })
      .finally(() => setLoading(false))
  }, [])

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const handleDelete = async () => {
    if (deleteId !== null) {
      await deleteUser(deleteId)
      .then(() => {
        setUsers(prev => prev.filter(w => w.id !== deleteId))
      })
      .catch((error) => {
        showError({id: notification_ids.user, title: locale.messages.title.error, description: error.message})
      })
      .finally(() => {
        setDeleteId(null)
      })
    }
  }

  if (loading) { return <LoadingSpinner title={locale.pages.admin.users} /> }
  if (networkError) { return <NetworkError page={locale.pages.admin.users} message={networkError} /> }

  return (
    <Container>
      <PageHeader
        title={locale.pages.admin.users}
        href='/account/admin/users/new'
      />

      {users.length === 0 ? (
        <EmptyState 
          variant='chip' 
          hint="No other users, you can create an new with the + in the top right." 
          rows={4}
        />
      ) : (
        <CardList
          items={users}
          keyField={(item) => item.id}
          title={(item) => item.username}
          subtitle={(item) =>  locale.enums.userrole[item.role]}
          rightSlot={(item) => (
            <ContextMenu
              items={[
                {
                  title: locale.buttons.edit,
                  action: () => router.push(`/account/admin/users/${item.id}`),
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