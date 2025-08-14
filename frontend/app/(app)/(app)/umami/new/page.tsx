'use client'

import { useI18n } from "@/locales/I18nContext";
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createUmami } from '@/lib/api/umami'
import PageHeader from '@/components/navigation/PageHeader'
import FormButtons from '@/components/FormButtons'
import TextInput from '@/components/inputs/TextInput'
import { showSuccess, showError } from '@/lib/toast'

export default function HostNewPage() {
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
      showSuccess(locale.messages.updated)
      router.push('/umami')
    } catch (error: any) {
      const message = error.message
      showError(locale.api_messages[message as 'DATA_ERROR'] || message)
    } finally {
      setLoading(false)
    }
  }

  const isCloud = form.type === 'cloud'
  const isSelfHosted = form.type === 'self_hosted'

  return (
    <div className="max-w-5xl mx-auto p-6">
      <PageHeader title={locale.ui.create} />

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
              aria-describedby="instanceNameHelp"
            />
            <p id="instanceNameHelp" className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {locale.forms.help.instanceName}
            </p>
          </div>

          <div className="h-px bg-gray-100 dark:bg-gray-800/60" />

          <div className="px-5 pt-5 pb-4">
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {locale.forms.labels.service.name}
            </label>

            <div
              className="inline-grid grid-cols-2 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50/70 dark:bg-gray-800/60"
              role="group"
              aria-label={locale.forms.labels.service.name}
            >
              {[
                { value: 'cloud', label: locale.forms.labels.service.type.cloud },
                { value: 'self_hosted', label: locale.forms.labels.service.type.selfhost },
              ].map(({ value, label }) => {
                const active = form.type === value
                return (
                  <button
                    key={value}
                    type="button"
                    className={[
                      "px-4 py-2 text-sm font-medium transition outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                      active
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-700/60"
                    ].join(" ")}
                    onClick={() => setForm(prev => ({ ...prev, type: value }))}
                    disabled={loading}
                    aria-pressed={active}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="px-5 pb-5 space-y-4">
            {isCloud && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800/60 bg-gray-50/60 dark:bg-gray-800/40 p-4">
                <TextInput
                  label={locale.forms.labels.apikey}
                  name="api_key"
                  value={form.api_key}
                  onChange={handleChange}
                  placeholder="xxxxxxxxxxxxxxxxxxxxxxxxx"
                  disabled={loading}
                  required={isCloud}
                  autoComplete="off"
                  inputMode="text"
                  aria-describedby="apiKeyHelp"
                />
                <p id="apiKeyHelp" className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {locale.forms.help.cloud}
                </p>
              </div>
            )}

            {isSelfHosted && (
              <div className="space-y-4 rounded-xl border border-gray-200 dark:border-gray-800/60 bg-gray-50/60 dark:bg-gray-800/40 p-4">
                <TextInput
                  label={locale.forms.labels.hostname}
                  name="hostname"
                  value={form.hostname}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  disabled={loading}
                  required={isSelfHosted}
                  inputMode="url"
                  autoComplete="url"
                  aria-describedby="hostHelp"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextInput
                    label={locale.forms.labels.username}
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="admin"
                    disabled={loading}
                    required={isSelfHosted}
                    autoComplete="username"
                    inputMode="text"
                  />
                  <TextInput
                    type="password"
                    label={locale.forms.labels.password.password}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    disabled={loading}
                    required={isSelfHosted}
                    autoComplete="current-password"
                  />
                </div>
                <p id="hostHelp" className="text-xs text-gray-500 dark:text-gray-400">
                  {locale.forms.help.selfhost}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200/70 dark:border-gray-800/60 bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4">
            <p className="text-xs text-gray-500 dark:text-gray-400"></p>
            <FormButtons
              cancelLabel={locale.buttons.cancel}
              saveLabel={locale.buttons.save}
              isSubmitting={loading}
            />
          </div>
        </section>
      </form>
    </div>
  )
}
