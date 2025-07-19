'use client'

import { useI18n } from "@/locales/I18nContext";
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  fetchInstances,
  fetchWebsitesByInstance,
  fetchSenders,
  fetchWebhookRecipients,
  createMailerJob,
} from '@/lib/api'
import { UmamiInstance, Website, Sender, WebhookRecipient } from '@/types'
import SelectBox from '@/components/SelectBox'
import MultiSelectListbox from "@/components/MultiSelectListbox";
import PageHeader from '@/components/PageHeader'
import FormButtons from '@/components/FormButtons'
import TextInput from '@/components/TextInput'

export default function NewMailerPage() {
  const router = useRouter()
  const { locale } = useI18n()

  const [instances, setInstances] = useState<UmamiInstance[]>([])
  const [websites, setWebsites] = useState<Website[]>([])
  const [senders, setSenders] = useState<Sender[]>([])
  const [webhookOptions, setWebhookOptions] = useState<WebhookRecipient[]>([])

  const [error, setError] = useState<string | null>(null)

  const WEEKDAYS = [
    { value: 0, label: locale.weekdays.monday },
    { value: 1, label: locale.weekdays.tuesday },
    { value: 2, label: locale.weekdays.wednesday },
    { value: 3, label: locale.weekdays.thursday },
    { value: 4, label: locale.weekdays.friday },
    { value: 5, label: locale.weekdays.saturday },
    { value: 6, label: locale.weekdays.sunday },
  ]

  const [form, setForm] = useState({
    name: '',
    instance_id: '',
    website_id: '',
    sender_id: '',
    frequency: 'daily',
    day: '',
    email_recipients: '',
    webhook_recipients: [] as number[],
    is_active: false,
  })

  useEffect(() => {
    fetchInstances().then(setInstances)
    fetchWebhookRecipients().then(setWebhookOptions)
    fetchSenders().then(setSenders)
  }, [])

  useEffect(() => {
    if (!form.instance_id) return
    const loadWebsites = async () => {
      try {
        const websites = await fetchWebsitesByInstance(Number(form.instance_id))
        setWebsites(websites)
        setError(null)
      } catch (err) {
        setWebsites([])
        setError('Websites konnten nicht geladen werden.')
      }
    }
    loadWebsites()
  }, [form.instance_id])


  useEffect(() => {
    const hasEmail = form.sender_id && form.email_recipients.trim() !== '';
    const hasWebhook = form.webhook_recipients.length > 0;

    // Wenn weder Mail noch Webhook konfiguriert ist, deaktiviere automatisch
    if (!hasEmail && !hasWebhook && form.is_active) {
      setForm(prev => ({ ...prev, is_active: false }));
    }

    // Optional: Automatisch aktivieren, wenn wieder gültige Konfiguration gesetzt wird
    if ((hasEmail || hasWebhook) && !form.is_active) {
      setForm(prev => ({ ...prev, is_active: true }));
    }
  }, [form.sender_id, form.email_recipients, form.webhook_recipients]);


  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const emailList = form.email_recipients
      .split(',')
      .map(e => e.trim())
      .filter(Boolean)

    await createMailerJob({
      name: form.name,
      host_id: Number(form.instance_id),
      website_id: form.website_id,
      sender_id: form.sender_id ? Number(form.sender_id) : null,
      frequency: form.frequency,
      day: ['weekly', 'monthly'].includes(form.frequency) ? Number(form.day) : null,
      email_recipients: form.sender_id ? emailList : [],
      webhook_recipients: form.webhook_recipients,
      is_active: form.is_active
    })
    router.push('/jobs')
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
          value={form.name}
          onChange={handleChange}
          placeholder={locale.forms.labels.name}
        />

        <div className="flex items-center gap-2">
          <SelectBox
            label={locale.forms.labels.umami}
            value={form.instance_id}
            onChange={(value) => setForm(prev => ({ ...prev, instance_id: value }))}
            options={instances.map(i => ({ value: String(i.id), label: i.name }))}
            placeholder="– Choose instance –"
          />

          {form.instance_id && (
          <SelectBox
            label={locale.forms.labels.website}
            value={form.website_id}
            onChange={(value) => setForm(prev => ({ ...prev, website_id: value }))}
            options={websites.map(w => ({ value: w.id, label: w.name }))}
            placeholder={websites.length ? locale.forms.placeholders.choose_website : locale.forms.placeholders.loading }
            disabled={!websites.length}
          />
          )}
        </div>

        <div className="flex items-center gap-2">
          <SelectBox
            label={locale.forms.labels.frequency}
            value={form.frequency}
            onChange={(value) => setForm(prev => ({ ...prev, frequency: value }))}
            options={[
              { value: 'daily', label: locale.enums.frequency.daily },
              { value: 'weekly', label: locale.enums.frequency.weekly },
              { value: 'monthly', label: locale.enums.frequency.monthly },
            ]}
          />

          {form.frequency === 'weekly' && (
            <SelectBox
              label={locale.forms.labels.weekday}
              value={form.day}
              onChange={(value) => setForm(prev => ({ ...prev, day: value }))}
              options={WEEKDAYS.map(day => ({
                value: String(day.value),
                label: day.label
              }))}
              placeholder={locale.forms.placeholders.choose_weekday}
            />
          )}
          {form.frequency === 'monthly' && (
            <SelectBox
              label={locale.forms.labels.day}
              value={form.day}
              onChange={(value) => setForm(prev => ({ ...prev, day: value }))}
              options={Array.from({ length: 31 }, (_, i) => ({
                value: String(i + 1),
                label: String(i + 1)
              }))}
              placeholder={locale.forms.placeholders.choose_day}
            />
          )}
        </div>

        {senders.length > 0 && (
          <>
            <SelectBox
              label={locale.forms.labels.email_sender}
              value={form.sender_id}
              onChange={(value) => setForm(prev => ({ ...prev, sender_id: value }))}
              options={senders.map(s => ({ value: String(s.id), label: s.name }))}
              placeholder={locale.forms.placeholders.choose_sender}
              canClear={true}
            />
            {form.sender_id && (
              <TextInput
                label={locale.forms.labels.email_recipients}
                name="email_recipients"
                value={form.email_recipients}
                onChange={handleChange}
                placeholder="anna@example.com, max@example.org"
                disabled={!form.sender_id}
              />
            )}
          </>
        )}


<MultiSelectListbox
  label={locale.forms.labels.webhook_recipients}
  options={webhookOptions} // [{id, name}]
  selected={form.webhook_recipients} // number[]
  onChange={(newSelected) => setForm(prev => ({ ...prev, webhook_recipients: newSelected }))}
  placeholder={locale.forms.placeholders.choose_webhook}
/>

        
{/*
        
        <label className="block">
          <span className="text-sm font-medium text-gray-700">{locale.forms.labels.webhook_recipients}</span>

          {webhookOptions.length === 0 ? (
            <small className='text-gray-700'><br />{locale.messages.no_webhooks}</small>
          ) : (
            <select
              multiple
              className="w-full border rounded p-2 mt-1"
              value={form.webhook_recipients.map(String)}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions).map(opt => Number(opt.value))
                setForm(prev => ({ ...prev, webhook_recipients: selected }))
              }}
            >
              {webhookOptions.map(wh => (
                <option key={wh.id} value={wh.id}>
                  {wh.name}
                </option>
              ))}
            </select>
          )}
        </label>
*/}
        
        {error && <div className="text-red-600">{error}</div>}

        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, is_active: e.target.checked }))
                  }
                  className="sr-only"
                />
                <div
                  className={`w-10 h-6 bg-gray-300 rounded-full transition-colors ${
                    form.is_active ? 'bg-green-500' : ''
                  }`}
                ></div>
                <div
                  className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    form.is_active ? 'translate-x-4' : ''
                  }`}
                ></div>
              </div>
            </label>
          </div>

          <FormButtons 
            cancelLabel={locale.buttons.cancel}
            saveLabel={locale.buttons.save}
            disabled={!form.instance_id || !form.website_id || (form.frequency === 'weekly' && !form.day)}
          />
        </div>
        
      </form>
    </div>
  )
}