'use client'

import { useI18n } from "@/locales/I18nContext";
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sender } from '@/types'
import { createMailer, testConnection } from '@/lib/api/mailers'
import PageHeader from '@/components/navigation/PageHeader'
import FormButtons from '@/components/FormButtons'
import TextInput from '@/components/inputs/TextInput'
import { showSuccess, showError, notification_ids } from '@/lib/toast'
import Container from "@/components/layout/Container";

export default function MailerNewPage() {
  const [sender, setSender] = useState<Sender | null>(null);
  const router = useRouter()
  const { locale } = useI18n()

  const [form, setForm] = useState({
    name: '',
    email: '',
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    use_tls: false,
    use_ssl: false,
    use_auth: true,
  })

  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (sender) {
      setForm({
        ...sender,
        smtp_password: '',
        use_auth: !!sender.smtp_username,
      })
    }
  }, [sender])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleEncryptionChange = (value: 'none' | 'tls' | 'ssl') => {
    setForm(prev => ({
      ...prev,
      use_tls: value === 'tls',
      use_ssl: value === 'ssl',
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...form,
      smtp_username: form.use_auth ? form.smtp_username : '',
      smtp_password: form.use_auth ? form.smtp_password : '',
    }

    try {
      await createMailer(payload)
      showSuccess({id: notification_ids.mailer, title: locale.messages.title.success, description: 'Created'})
      router.push('/mailers')
    } catch (err: any) {
      const code = err.message as 'DATA_ERROR'
      showError({id: notification_ids.mailer, title: locale.messages.title.error, description: locale.api_messages[code]})
    } finally {
      setIsSaving(false)
    }
  }

  const handleTest = async () => {
    if (!form) return
    setTesting(true)

    try {
      const payload = {
        ...form,
        smtp_username: form.use_auth ? form.smtp_username : '',
        smtp_password: form.use_auth ? form.smtp_password : '',
      }
      await testConnection(payload)
      showSuccess({id: notification_ids.mailer_test, title: locale.messages.title.success, description: locale.messages.saved})
    } catch (error: any) {
      const code = error.message as 'DATA_ERROR'
      showError({id: notification_ids.mailer_test, title: locale.messages.title.error, description: locale.api_messages[code]})
    } finally {
      setTesting(false)
    }
  }

  return (
    <Container>
      <PageHeader title={locale.ui.create} />

      <form onSubmit={handleSubmit} className="space-y-8">

        <section className="rounded-2xl border border-gray-200/70 dark:border-gray-800/60 bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm shadow-sm">
          <div className="px-5 pt-5 pb-1">
            <h2 className="text-sm font-semibold tracking-wide text-gray-900 dark:text-gray-100">
              {locale.forms.sections.sender}
            </h2>
          </div>
          <div className="px-5 pb-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput
                label={locale.forms.labels.name}
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder={locale.forms.labels.name}
                required
                autoComplete="off"
                inputMode="text"
              />
              <TextInput
                label={locale.forms.labels.sender_email}
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="sender@local.net"
                required
                autoComplete="email"
                inputMode="email"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200/70 dark:border-gray-800/60 bg-white/60 dark:bg-gray-900/40 shadow-sm">
          <div className="px-5 pt-5 pb-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {locale.forms.sections.smtp_host}
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <TextInput
                label=""
                name="smtp_host"
                value={form.smtp_host}
                onChange={handleChange}
                placeholder="local.net"
              />
              <TextInput
                type="number"
                label=""
                name="smtp_port"
                value={String(form.smtp_port)}
                onChange={handleChange}
                placeholder="1025"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200/70 dark:border-gray-800/60 bg-white/60 dark:bg-gray-900/40 shadow-sm">
          <div className="px-5 pt-5 pb-3 space-y-4">
            <div className="flex items-center gap-3 pb-2">
              <input
                type="checkbox"
                name="use_auth"
                id="use_auth"
                checked={form.use_auth}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="use_auth" className="text-sm text-gray-900 dark:text-gray-100">
                {locale.forms.labels.auth_required}
              </label>
            </div>

            {form.use_auth && (
              <div className="flex flex-col sm:flex-row gap-4">
                <TextInput
                  label={locale.forms.labels.smtp.username}
                  name="smtp_username"
                  value={form.smtp_username}
                  onChange={handleChange}
                  placeholder={locale.forms.labels.smtp.username}
                />
                <TextInput
                  type='password'
                  label={locale.forms.labels.smtp.password}
                  name="smtp_password"
                  value={form.smtp_password}
                  onChange={handleChange}
                  placeholder={locale.forms.labels.smtp.password}
                />
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200/70 dark:border-gray-800/60 bg-white/60 dark:bg-gray-900/40 shadow-sm">
          <div className="px-5 pt-5 pb-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">{locale.forms.labels.encryption}</h2>
            <div className="inline-grid grid-cols-3 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50/70 dark:bg-gray-800/60">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium transition ${!form.use_tls && !form.use_ssl ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'}`}
                onClick={() => handleEncryptionChange('none')}
              >
                {locale.enums.encryption.none}
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium transition ${form.use_tls ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'}`}
                onClick={() => handleEncryptionChange('tls')}
              >
                {locale.enums.encryption.tls}
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium transition ${form.use_ssl ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'}`}
                onClick={() => handleEncryptionChange('ssl')}
              >
                {locale.enums.encryption.ssl}
              </button>
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
              {testResult && (
                <span className={`text-sm ${testResult.startsWith('✅')
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'}`}>
                  {testResult}
                </span>
              )}
            </div>

            <FormButtons
              cancelLabel={locale.buttons.cancel}
              saveLabel={locale.buttons.create}
            />
          </div>
        </section>
      </form>
    </Container>
  )
}
