'use client'

import { useI18n } from "@/locales/I18nContext";
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  fetchWebhook,
  updateWebhook,
  testWebhook
} from '@/lib/api/webhook'
import { WebhookRecipient } from '@/types'
import LoadingSpinner from '@/components/LoadingSpinner'
import SelectBox from '@/components/SelectBox'
import PageHeader from '@/components/PageHeader'
import FormButtons from '@/components/FormButtons'
import TextInput from '@/components/TextInput'
import { showSuccess, showError } from '@/lib/toast'
import test from "node:test";

export default function Edit_Webhook({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  const { locale } = useI18n()
  const [form, setForm] = useState<WebhookRecipient | null>(null)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchWebhook(params.id)
        .then(setForm)
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
      await updateWebhook(form.id, {
        name: form.name,
        url: form.url,
      })
      showSuccess('Updated')
    } catch (error: any) {
      const message = error?.response?.data?.detail || error?.message || 'Failed to update webhook'
      showError(message)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    try {
      const payload = {
        ...form
      }
      await testWebhook(payload)
      showSuccess('Test success!')
      console.log(payload)
    } catch (e: any) {
      showError(`Error: ${e.message || 'Connection failure.'}`)
    } finally {
      setTesting(false)
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

        <TextInput
          label={locale.forms.labels.name}
          name="name"
          value={String(form?.name)}
          onChange={handleChange}
          placeholder={locale.forms.labels.name}
        />
        <TextInput
          label={form?.type === 'CUSTOM' ? locale.forms.labels.webhook_type.url : locale.forms.labels.webhook_type.token}
          name="url"
          value={String(form?.url)}
          onChange={handleChange}
          placeholder={form?.type === 'CUSTOM' ? 'https://example.com/webhook' : 'xxxxxxxxxxxxxxxxxx'}
        />

        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="px-4 py-2 rounded border transition
                bg-gray-100 dark:bg-gray-800
                border-gray-300 dark:border-gray-600
                text-gray-800 dark:text-gray-100
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? locale.buttons.states.testing : locale.buttons.test}
            </button>
          </div>


          <FormButtons
            cancelLabel={locale.buttons.cancel}
            saveLabel={locale.buttons.update}
          />
        </div>
      </form>
    </div>
  )
}