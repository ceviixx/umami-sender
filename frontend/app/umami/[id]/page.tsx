'use client'

import { useI18n } from "@/locales/I18nContext";
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { UmamiInstance } from '@/types'
import { 
  fetchUmami, 
  updateUmami 
} from '@/lib/api/umami'
import SelectBox from '@/components/SelectBox'
import PageHeader from '@/components/PageHeader'
import FormButtons from '@/components/FormButtons'
import TextInput from '@/components/TextInput'
import { showSuccess, showError } from '@/lib/toast'

export default function InstanceDetails() {
  const router = useRouter()
  const { locale } = useI18n()

  const params = useParams()
  const id = Number(params.id)

  const [form, setForm] = useState<UmamiInstance | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) return

    fetchUmami(id)
      .then(setForm)
      .catch(() => setError('Fehler beim Laden der Instanz'))
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => prev ? { ...prev, [name]: value } : prev)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return

    setLoading(true)
    setError(null)

    try {
      await updateUmami(id, form)
      showSuccess('Umami-Instanz erfolgreich aktualisiert')
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.message || 'Fehler beim Speichern'
      setError(message)
      showError(message)
    } finally {
      setLoading(false)
    }
  }

  if (!form) {
    return <div className="p-6 text-gray-600">Lade Daten...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader
        hasBack={true}
        title={locale.ui.edit}
        />

      <form onSubmit={handleSubmit} className="space-y-3">
        <TextInput
            label={locale.forms.labels.name}
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder={locale.forms.labels.name}
        />

        <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">{locale.forms.labels.service.name}</label>
            <div className="grid grid-cols-2 bg-gray-100 rounded-lg overflow-hidden">
                {[
                { value: 'cloud', label: locale.forms.labels.service.type.cloud },
                { value: 'self_hosted', label: locale.forms.labels.service.type.selfhost },
                ].map(({ value, label }) => (
                <button
                    key={value}
                    type="button"
                    className={`w-full px-4 py-2 text-sm font-medium focus:outline-none transition ${
                    form.type === value
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setForm(prev => ({ ...prev, type: value }))}
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
            />
            <div className="flex items-center gap-2">
                <TextInput
                    label={locale.forms.labels.username}
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="admin"
                />
                <TextInput
                    type='password'
                    label={locale.forms.labels.password}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="umami"
                />
            </div>
          </>
        )}

        <FormButtons
          cancelLabel={locale.buttons.cancel}
          saveLabel={locale.buttons.update}
          isSubmitting={loading}
        />
      </form>
    </div>
  )
}