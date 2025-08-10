'use client'

import { useI18n } from "@/locales/I18nContext";
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  createUser
} from '@/lib/api/users'
import SelectBox from '@/components/SelectBox'
import PageHeader from '@/components/PageHeader'
import FormButtons from '@/components/FormButtons'
import TextInput from '@/components/TextInput'
import { showError, showSuccess } from '@/lib/toast'

export default function NewUserPage() {
  const router = useRouter()
  const { locale } = useI18n()
  const [form, setForm] = useState<{
    username: string;
    role: string;
    password: string;
  }>({
    username: '',
    role: 'user',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await createUser(form)
      showSuccess('User created successfully!')
      router.push('/account/admin/users')
    } catch (error: any) {
      const message = error?.response?.detail || error?.message || 'An unexpected error occurred'
      showError(message)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader
        title={locale.ui.create}
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