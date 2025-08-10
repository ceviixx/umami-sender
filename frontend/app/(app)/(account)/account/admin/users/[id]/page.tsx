'use client'

import { useI18n } from "@/locales/I18nContext";
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  fetchUser,
  updateUser,
} from '@/lib/api/users'
import LoadingSpinner from '@/components/LoadingSpinner'
import SelectBox from '@/components/SelectBox'
import PageHeader from '@/components/PageHeader'
import FormButtons from '@/components/FormButtons'
import TextInput from '@/components/TextInput'
import { showSuccess, showError } from '@/lib/toast'

export default function Edit_User({ params }: { params: { id: string } }) {
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
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader
        hasBack={true}
        title={locale.ui.edit}
      />
      <form onSubmit={handleSubmit} className="space-y-4">

        <div className="flex items-center gap-2">
          <TextInput
            label={locale.forms.labels.username}
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder={locale.forms.labels.username}
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
          label={locale.forms.labels.password}
          name="password"
          value={String(form.password)}
          onChange={handleChange}
          placeholder={locale.forms.labels.password}
        />

        <FormButtons
          cancelLabel={locale.buttons.cancel}
          saveLabel={locale.buttons.create}
        />
      </form>
    </div>
  )
}