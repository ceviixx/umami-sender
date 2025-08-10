'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import TextInput from '@/components/TextInput'
import FormButtons from '@/components/FormButtons'
import { updatePassword } from '@/lib/api/me'
import { showError, showSuccess } from '@/lib/toast'

type FormData = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ChangePasswordPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await updatePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      })
      showSuccess('Password updated successfully')
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      showError(error.message || 'Failed to update password')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader title="Change Password" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="Current Password"
          name="currentPassword"
          type="password"
          value={form.currentPassword}
          onChange={handleChange}
          disabled={submitting}
        />

        <TextInput
          label="New Password"
          name="newPassword"
          type="password"
          value={form.newPassword}
          onChange={handleChange}
          disabled={submitting}
        />

        <TextInput
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          disabled={submitting}
        />

        <FormButtons
          isSubmitting={submitting}
          hasCancel={false}
          saveLabel={'{CHANGE_PASSWORD}'}
        />
      </form>
    </div>
  )
}
