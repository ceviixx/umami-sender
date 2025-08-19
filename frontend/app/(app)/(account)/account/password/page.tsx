'use client'

import { useI18n } from "@/locales/I18nContext";
import { useState } from 'react'
import PageHeader from '@/components/navigation/PageHeader'
import TextInput from '@/components/inputs/TextInput'
import FormButtons from '@/components/FormButtons'
import { updatePassword } from '@/lib/api/me'
import { showError, showSuccess } from '@/lib/toast'
import Container from '@/components/layout/Container'

type FormData = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ChangePasswordPage() {
  const { locale } = useI18n()
  const [form, setForm] = useState<FormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
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
    <Container>
      <PageHeader title={locale.pages.changepassword} />

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="rounded-2xl border border-gray-200/70 dark:border-gray-800/60 bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm shadow-sm">
          <div className="px-5 pt-5 pb-1">
            <h2 className="text-sm font-semibold tracking-wide text-gray-900 dark:text-gray-100">
              {locale.forms.labels.password.password}
            </h2>
          </div>

          <div className="px-5 pb-5 space-y-4">
            <TextInput
              label={locale.forms.labels.password.current}
              name="currentPassword"
              type="password"
              value={form.currentPassword}
              onChange={handleChange}
              disabled={submitting}
              required
              autoComplete="current-password"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                label={locale.forms.labels.password.new}
                name="newPassword"
                type="password"
                value={form.newPassword}
                onChange={handleChange}
                disabled={submitting}
                required
                autoComplete="new-password"
              />
              <TextInput
                label={locale.forms.labels.password.confirm}
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                disabled={submitting}
                required
                autoComplete="new-password"
              />
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400"></p>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200/70 dark:border-gray-800/60 bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4">
            <p className="text-xs text-gray-500 dark:text-gray-400"></p>
            <FormButtons
              hasCancel={false}
              isSubmitting={submitting}
              saveLabel={locale.buttons.change_password}
            />
          </div>
        </section>
      </form>
    </Container>
  )
}
