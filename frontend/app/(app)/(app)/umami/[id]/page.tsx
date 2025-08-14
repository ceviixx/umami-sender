'use client'

import { useI18n } from "@/locales/I18nContext";
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { UmamiType } from '@/types'
import { fetchUmami, updateUmami } from '@/lib/api/umami'
import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from '@/components/navigation/PageHeader'
import FormButtons from '@/components/FormButtons'
import TextInput from '@/components/inputs/TextInput'
import { showSuccess, showError } from '@/lib/toast'

export default function HostEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { locale } = useI18n()

  const [form, setForm] = useState<{
    id: number;
    name: string;
    type: UmamiType;
    hostname: string | null;
    username: string | null;
    password: string | null;
    api_key: string | null;
  }>({
    id: 0,
    name: '',
    type: 'cloud',
    hostname: null,
    username: null,
    password: null,
    api_key: null
  });
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params.id) return

    fetchUmami(params.id)
      .then(setForm)
      .finally(() => setLoading(false))
      .catch((error) => showError(locale.api_messages[error as 'DATA_ERROR'] || error))
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => prev ? { ...prev, [name]: value } : prev)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return

    try {
      await updateUmami(params.id, form)
      showSuccess(locale.messages.updated)
    } catch (error: any) {
      const message = error.message
      showError(locale.api_messages[message as 'DATA_ERROR'] || message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) { return <LoadingSpinner title={locale.ui.edit} /> }

  const isCloud = form.type === 'cloud'
  const isSelfHosted = form.type === 'self_hosted'

  return (
    <div className="max-w-5xl mx-auto p-6">
      <PageHeader hasBack={true} title={locale.ui.edit} />

      <form onSubmit={handleSubmit} className="space-y-8">

        <section className="rounded-2xl border border-gray-200/70 dark:border-gray-800/60 bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm shadow-sm">
          <div className="px-5 pt-5 pb-1">
            <h2 className="text-sm font-semibold tracking-wide text-gray-900 dark:text-gray-100">
              {locale.forms.labels.name}
            </h2>
          </div>
          <div className="px-5 pb-5">
            <TextInput
              label=""
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder={locale.forms.labels.name}
              disabled={loading}
              required
              autoComplete="off"
              inputMode="text"
              aria-describedby="instNameHelp"
            />
            <p id="instNameHelp" className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {locale.forms.help.instanceName}
            </p>
          </div>
        </section>

        {isCloud && (
          <section className="rounded-2xl border border-gray-200/70 dark:border-gray-800/60 bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm shadow-sm">
            <div className="px-5 pt-5 pb-1">
              <h2 className="text-sm font-semibold tracking-wide text-gray-900 dark:text-gray-100">
                {locale.forms.labels.apikey}
              </h2>
            </div>
            <div className="px-5 pb-5">
              <TextInput
                label=""
                name="api_key"
                value={form.api_key ?? ''}
                onChange={handleChange}
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxx"
                disabled={loading}
                required
                autoComplete="off"
                inputMode="text"
                aria-describedby="apiKeyHelp"
              />
              <p id="apiKeyHelp" className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {locale.forms.help.cloud}
              </p>
            </div>
          </section>
        )}

        {isSelfHosted && (
          <section className="rounded-2xl border border-gray-200/70 dark:border-gray-800/60 bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm shadow-sm">
            <div className="px-5 pt-5 pb-1">
              <h2 className="text-sm font-semibold tracking-wide text-gray-900 dark:text-gray-100">
                {locale.forms.labels.hostname}
              </h2>
            </div>
            <div className="px-5 pb-5 space-y-4">
              <TextInput
                label=""
                name="hostname"
                value={form.hostname ?? ''}
                onChange={handleChange}
                placeholder="https://example.com"
                disabled={loading}
                required
                inputMode="url"
                autoComplete="url"
                aria-describedby="hostHelp"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextInput
                  label={locale.forms.labels.username}
                  name="username"
                  value={form.username ?? ''}
                  onChange={handleChange}
                  placeholder="admin"
                  disabled={loading}
                  required
                  autoComplete="username"
                  inputMode="text"
                />
                <TextInput
                  type="password"
                  label={locale.forms.labels.password.password}
                  name="password"
                  value={form.password ?? ''}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={loading}
                  required
                  autoComplete="current-password"
                />
              </div>
              <p id="hostHelp" className="text-xs text-gray-500 dark:text-gray-400">
                {locale.forms.help.selfhost}
              </p>
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-gray-200/70 dark:border-gray-800/60 bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3">
            <p className="text-xs text-gray-500 dark:text-gray-400"></p>
            <FormButtons
              cancelLabel={locale.buttons.cancel}
              saveLabel={locale.buttons.update}
              isSubmitting={loading}
            />
          </div>
        </section>
      </form>
    </div>
  )
}
