'use client'

import { useI18n } from "@/locales/I18nContext";
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { UmamiInstance, UmamiType } from '@/types'
import { 
  fetchUmami, 
  updateUmami 
} from '@/lib/api/umami'
import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from '@/components/PageHeader'
import FormButtons from '@/components/FormButtons'
import TextInput from '@/components/TextInput'
import { showSuccess, showError } from '@/lib/toast'

export default function InstanceDetails() {
  const router = useRouter()
  const { locale } = useI18n()

  const params = useParams()
  const id = Number(params.id)

  const [form, setForm] = useState<{
    id: number;
    name: string;
    type: UmamiType;
    hostname: String | null;
    username: String | null;
    password: String | null;
    api_key: String | null;
  }>({
    id: 0,
    name: '',
    type: 'cloud',
    hostname: null,
    username: null,
    password: null,
    api_key: null
  });
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    fetchUmami(id)
      .then(setForm)
      .finally(() => setLoading(false))
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
      showError(message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) { return <LoadingSpinner title={locale.ui.edit} /> }

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

        {form.type === 'cloud' && (
            <TextInput
                label={locale.forms.labels.apikey}
                name="api_key"
                value={String(form.api_key)}
                onChange={handleChange}
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxx"
            />
        )}

        {form.type === 'self_hosted' && (
          <>
            <TextInput
                label={locale.forms.labels.hostname}
                name="hostname"
                value={String(form.hostname)}
                onChange={handleChange}
                placeholder="https://example.com"
            />
            <div className="flex items-center gap-2">
                <TextInput
                    label={locale.forms.labels.username}
                    name="username"
                    value={String(form.username)}
                    onChange={handleChange}
                    placeholder="admin"
                />
                <TextInput
                    type='password'
                    label={locale.forms.labels.password}
                    name="password"
                    value={String(form.password)}
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