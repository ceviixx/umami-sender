'use client'

import { useI18n } from "@/locales/I18nContext";
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createWebhookRecipient, testWebook } from '@/lib/api'
import SelectBox from '@/components/SelectBox'
import PageHeader from '@/components/PageHeader'
import FormButtons from '@/components/FormButtons'
import TextInput from '@/components/TextInput'
import { showError, showSuccess } from '@/lib/toast'

export default function NewWebhookPage() {
  const router = useRouter()
  const { locale } = useI18n()
  const [form, setForm] = useState({ name: '', url: '', type: '' })
  const [testing, setTesting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await createWebhookRecipient(form)
      showSuccess('Webhook recipient created successfully')
      router.push('/webhooks')
    } catch (error: any) {
      // Wenn deine Funktion den Fehler in einem `detail`-Feld liefert:
      const message = error?.response?.detail || error?.message || 'An unexpected error occurred'
      showError(message)
    }
  }

  const handleTest = async () => {
      setTesting(true)
      try {
        const payload = {
          ...form
        }
        await testWebook(payload)
        showSuccess('Test success!')
        console.log(payload)
      } catch (e: any) {
        // setTestResult(`❌ Error: ${e.message || 'Connection failure.'}`)
        showError(`Error: ${e.message || 'Connection failure.'}`)
      } finally {
        setTesting(false)
      }
    }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader
        title={locale.ui.create}
      />
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label={locale.forms.labels.name}
          name="name"
          value={form?.name}
          onChange={handleChange}
          placeholder={locale.forms.labels.name}
        />
        <SelectBox
          label={locale.forms.labels.webhook}
          value={form.type}
          onChange={(value) => setForm({ ...form, type: value })}
          options={[
            { value: 'DISCORD', label: 'Discord' },
            { value: 'MS_TEAMS', label: 'Microsoft Teams' },
            { value: 'SLACK', label: 'Slack' },
            { value: 'CUSTOM', label: locale.forms.labels.custom },
          ]}
          placeholder={locale.forms.placeholders.choose_webhook_type}
        />
        <TextInput
          label={form.type === 'CUSTOM' ? locale.forms.labels.webhook_type.url : locale.forms.labels.webhook_type.token}
          name="url"
          value={form?.url}
          onChange={handleChange}
          placeholder={form.type === 'CUSTOM' ? 'https://example.com/webhook' : 'xxxxxxxxxxxxxxxxxx'}
        />

        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="px-4 py-2 bg-gray-100 border border-gray-300 rounded"
            >
              {testing ? locale.buttons.states.testing : locale.buttons.test}
            </button>
          </div>

          <FormButtons
            cancelLabel={locale.buttons.cancel}
            saveLabel={locale.buttons.create}
          />
        </div>
        
      </form>
    </div>
  )
}