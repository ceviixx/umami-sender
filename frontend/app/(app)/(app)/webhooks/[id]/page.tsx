'use client'

import { useI18n } from "@/locales/I18nContext";
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchWebhook, updateWebhook, testWebhook } from '@/lib/api/webhook'
import { WebhookRecipient } from '@/types'
import LoadingSpinner from '@/components/LoadingSpinner'
import PageHeader from '@/components/navigation/PageHeader'
import FormButtons from '@/components/FormButtons'
import TextInput from '@/components/inputs/TextInput'
import { showSuccess, showError } from '@/lib/toast'

export default function WebhookEditPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true)

  const { locale } = useI18n()
  const [form, setForm] = useState<WebhookRecipient | null>(null)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    if (!params.id) return

    fetchWebhook(params.id)
      .then(setForm)
      .finally(() => setLoading(false))
      .catch((error) => showError(locale.api_messages[error as 'DATA_ERROR'] || error))
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!form) return
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return

    try {
      await updateWebhook(form.id, {
        name: form.name,
        url: form.url,
      })
      showSuccess(locale.messages.updated)
      // router.back()
    } catch (error: any) {
      const message = error.message
      showError(locale.api_messages[message as 'DATA_ERROR'] || message)
    }
  }

  const handleTest = async () => {
    if (!form) return
    setTesting(true)
    try {
      await testWebhook({ ...form })
      showSuccess(locale.messages.test_success)
    } catch (error: any) {
      const message = error.message
      showError(locale.api_messages[message as 'DATA_ERROR'] || message)
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return <LoadingSpinner title={locale.ui.edit} />
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <PageHeader hasBack title={locale.ui.edit} />

      <form onSubmit={handleSubmit} className="space-y-8">
        
        <section className="rounded-2xl border border-gray-200/70 dark:border-gray-800/60 bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm shadow-sm">
          <div className="px-5 pt-5 pb-1">
            <h2 className="text-sm font-semibold tracking-wide text-gray-900 dark:text-gray-100">
              {locale.forms.sections.type}
            </h2>
          </div>

          <div className="px-5 pb-5 space-y-4">
            <TextInput
              label={locale.forms.labels.name}
              name="name"
              value={String(form?.name ?? '')}
              onChange={handleChange}
              placeholder={locale.forms.labels.name}
              required
              autoComplete="off"
              inputMode="text"
              aria-describedby="whNameHelp"
            />
            <p id="whNameHelp" className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
              {locale.forms.help.webhookName}
            </p>

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
            <p id="whUrlHelp" className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
              {locale.forms.help.webhookUrl}
            </p>
          </div>
        </section>


        <section className="rounded-2xl border border-gray-200/70 dark:border-gray-800/60 bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleTest}
                disabled={testing || !form}
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors
                          text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700
                          hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {testing ? locale.buttons.states.testing : locale.buttons.test}
              </button>
            </div>

            <FormButtons
              cancelLabel={locale.buttons.cancel}
              saveLabel={locale.buttons.update}
            />
          </div>
        </section>
      </form>
    </div>
  )
}
