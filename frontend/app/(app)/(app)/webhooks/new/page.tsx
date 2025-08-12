'use client'

import { useI18n } from "@/locales/I18nContext";
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createWebhook, testWebhook } from '@/lib/api/webhook'
import SelectBox from '@/components/inputs/SelectBox'
import PageHeader from '@/components/navigation/PageHeader'
import FormButtons from '@/components/FormButtons'
import TextInput from '@/components/inputs/TextInput'
import { showError, showSuccess } from '@/lib/toast'

export default function WebhookNewPage() {
  const router = useRouter()
  const { locale } = useI18n()
  const [form, setForm] = useState<{
    name: string;
    url: String | null;
    type: String | null;
  }>({
    name: '',
    url: '',
    type: null
  });
  const [testing, setTesting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await createWebhook(form)
      showSuccess('Webhook recipient created successfully')
      router.push('/webhooks')
    } catch (error: any) {
      const message = error?.response?.detail || error?.message || 'An unexpected error occurred'
      showError(message)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    try {
      const payload = { ...form }
      await testWebhook(payload)
      showSuccess('Test success!')
      console.log(payload)
    } catch (e: any) {
      showError(`Error: ${e.message || 'Connection failure.'}`)
    } finally {
      setTesting(false)
    }
  }

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
              value={form?.name}
              onChange={handleChange}
              placeholder={locale.forms.labels.name}
              required
              autoComplete="off"
              inputMode="text"
              aria-describedby="whNameHelp"
            />
            <p id="whNameHelp" className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {locale.forms.help.webhookName}
            </p>
          </div>

          <div className="h-px bg-gray-100 dark:bg-gray-800/60" />

          <div className="px-5 pt-5 pb-5 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {locale.forms.labels.type}
              </label>
              <SelectBox
                label=""
                value={String(form.type ?? '')}
                onChange={(value) => setForm({ ...form, type: value })}
                options={[
                  { value: 'DISCORD', label: 'Discord' },
                  { value: 'SLACK', label: 'Slack' },
                  { value: 'CUSTOM', label: locale.forms.labels.custom },
                ]}
                placeholder={locale.forms.placeholders.choose_webhook_type}
              />
            </div>

            <div>
              <TextInput
                label={locale.forms.labels.webhook_type.url}
                name="url"
                value={String(form?.url ?? '')}
                onChange={handleChange}
                placeholder="https://example.com/webhook/xxxxxxxxxxxxxxxxxx"
                required
                inputMode="url"
                autoComplete="url"
                aria-describedby="whUrlHelp"
              />
              <p id="whUrlHelp" className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {locale.forms.help.webhookUrl}
              </p>
            </div>
          </div>
        </section>
        
        <section className="rounded-2xl border border-gray-200/70 dark:border-gray-800/60 bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleTest}
                disabled={testing}
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors
                          text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700
                          hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {testing ? locale.buttons.states.testing : locale.buttons.test}
              </button>
            </div>

            <FormButtons
              cancelLabel={locale.buttons.cancel}
              saveLabel={locale.buttons.create}
            />
          </div>
        </section>
      </form>
    </div>
  )
}
