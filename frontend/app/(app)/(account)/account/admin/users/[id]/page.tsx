'use client'

import { useI18n } from "@/locales/I18nContext";
import { useEffect, useState } from 'react'
import { fetchUser, updateUser } from '@/lib/api/users'
import LoadingSpinner from '@/components/LoadingSpinner'
import SelectBox from '@/components/inputs/SelectBox'
import PageHeader from '@/components/navigation/PageHeader'
import FormButtons from '@/components/FormButtons'
import TextInput from '@/components/inputs/TextInput'
import { showSuccess, showError } from '@/lib/toast'
import Container from '@/components/layout/Container'

export default function UserEditPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true)

  const { locale } = useI18n()
  const [form, setForm] = useState<{
    username: string;
    role: string;
    password: string | null;
  }>({
    username: '',
    role: 'user',
    password: null
  });

  useEffect(() => {
    if (params.id) {
      fetchUser(params.id)
        .then((data) => {
          setForm({
            username: data.username,
            role: data.role,
            password: ''
          })
        })
        .finally(() => setLoading(false))
    }
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!form) return
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return

    try {
      await updateUser(params.id, form)
      showSuccess('Updated')
    } catch (error: any) {
      const message = error?.response?.data?.detail || error?.message || 'Failed to update webhook'
      showError(message)
    }
  }

  if (loading) { return <LoadingSpinner title={locale.ui.edit} /> }

  return (
    <Container>
      <PageHeader hasBack={true} title={locale.ui.edit} />

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="rounded-2xl border border-gray-200/70 dark:border-gray-800/60 bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm shadow-sm">
          <div className="px-5 pt-5 pb-1">
            <h2 className="text-sm font-semibold tracking-wide text-gray-900 dark:text-gray-100">
              {locale.forms.sections.user}
            </h2>
          </div>

          <div className="px-5 pb-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                label={locale.forms.labels.username}
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder={locale.forms.labels.username}
                required
                autoComplete="username"
              />
              <SelectBox
                label={locale.forms.labels.role}
                value={form.role}
                onChange={(value) => setForm({ ...form, role: value ?? '' })}
                options={[
                  { value: 'admin', label: locale.enums.userrole.admin },
                  { value: 'user', label: locale.enums.userrole.user },
                ]}
                placeholder={locale.forms.placeholders.choose_role}
              />
            </div>

            <TextInput
              type="password"
              label={locale.forms.labels.password.password}
              name="password"
              value={String(form.password ?? '')}
              onChange={handleChange}
              placeholder={locale.forms.labels.password.password}
              autoComplete="new-password"
            />

            <p className="text-xs text-gray-500 dark:text-gray-400">
              {locale.forms.help.userEditHint}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200/70 dark:border-gray-800/60 bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4">
            <p className="text-xs text-gray-500 dark:text-gray-400"></p>
            <FormButtons
              cancelLabel={locale.buttons.cancel}
              saveLabel={locale.buttons.update}
            />
          </div>
        </section>
      </form>
    </Container>
  )
}
