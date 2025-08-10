'use client'

import { useI18n } from "@/locales/I18nContext";
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createUmami } from '@/lib/api/umami'
import PageHeader from '@/components/PageHeader'
import FormButtons from '@/components/FormButtons'
import TextInput from '@/components/TextInput'
import { showSuccess, showError } from '@/lib/toast'

export default function InstanceForm() {
  const router = useRouter()
  const { locale } = useI18n()

  const [form, setForm] = useState({
    name: '',
    type: 'cloud',
    api_key: '',
    hostname: '',
    username: '',
    password: '',
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createUmami(form)
      showSuccess('Umami-Instanz erfolgreich gespeichert')
      router.push('/umami')
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.message || 'Fehler beim Speichern'
      showError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader
        title={locale.ui.create}
      />

      <form onSubmit={handleSubmit} className="space-y-3">
        <TextInput
          label={locale.forms.labels.name}
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder={locale.forms.labels.name}
          disabled={loading}
        />

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            {locale.forms.labels.service.name}
          </label>
          <div className="grid grid-cols-2 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            {[
              { value: 'cloud', label: locale.forms.labels.service.type.cloud },
              { value: 'self_hosted', label: locale.forms.labels.service.type.selfhost },
            ].map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`w-full px-4 py-2 text-sm font-medium focus:outline-none transition ${form.type === value
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700'
                  }`}
                onClick={() => setForm(prev => ({ ...prev, type: value }))}
                disabled={loading}
              >
                {label}
              </button>
            ))}
          </div>
        </div>


        {form.type === 'cloud' && (
          <TextInput
            label={locale.forms.labels.apikey}
            name="api_key"
            value={form.api_key}
            onChange={handleChange}
            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxx"
            disabled={loading}
          />
        )}

        {form.type === 'self_hosted' && (
          <>
            <TextInput
              label={locale.forms.labels.hostname}
              name="hostname"
              value={form.hostname}
              onChange={handleChange}
              placeholder="https://example.com"
              disabled={loading}
            />
            <div className="flex items-center gap-2">
              <TextInput
                label={locale.forms.labels.username}
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="admin"
                disabled={loading}
              />
              <TextInput
                type='password'
                label={locale.forms.labels.password}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="umami"
                disabled={loading}
              />
            </div>
          </>
        )}

        <FormButtons
          cancelLabel={locale.buttons.cancel}
          saveLabel={locale.buttons.save}
          isSubmitting={loading}
        />
      </form>

    </div>
  )
}