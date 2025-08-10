'use client'

import { useI18n } from "@/locales/I18nContext";
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sender } from '@/types'
import { createMailer, testConnection } from '@/lib/api/mailers'
import PageHeader from '@/components/PageHeader'
import FormButtons from '@/components/FormButtons'
import TextInput from '@/components/TextInput'
import { showSuccess, showError } from '@/lib/toast'

export default function SenderForm() {
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
      showSuccess('Created')
      router.push('/mailers')
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.message || 'Fehler beim Speichern'
      showError(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const payload = {
        ...form,
        smtp_username: form.use_auth ? form.smtp_username : '',
        smtp_password: form.use_auth ? form.smtp_password : '',
      }
      await testConnection(payload)
      showSuccess('Test success!')
    } catch (e: any) {
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
        <div className="flex items-center gap-2">
          <TextInput
            label={locale.forms.labels.name}
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder={locale.forms.labels.name}
          />
          <TextInput
            label={locale.forms.labels.sender_email}
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="sender@local.net"
          />
        </div>

        <div className="flex items-center gap-2">
          <TextInput
            label={locale.forms.labels.smtp.host}
            name="smtp_host"
            value={form.smtp_host}
            onChange={handleChange}
            placeholder="local.net"
          />
          <TextInput
            type='number'
            label={locale.forms.labels.smtp.port}
            name="smtp_port"
            value={String(form.smtp_port)}
            onChange={handleChange}
            placeholder="1025"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                name="use_auth"
                checked={form.use_auth}
                onChange={handleChange}
                className="sr-only"
              />
              <div
                className={`w-10 h-6 rounded-full transition-colors
                  ${form.use_auth
                    ? 'bg-green-500'
                    : 'bg-gray-300 dark:bg-gray-600'}
                `}
              ></div>
              <div
                className={`absolute left-1 top-1 w-4 h-4 rounded-full shadow transition-transform
                  ${form.use_auth ? 'translate-x-4' : ''}
                  bg-white dark:bg-gray-100
                `}
              ></div>
            </div>
            <span className="ml-3 text-sm text-gray-900 dark:text-gray-100">
              {locale.forms.labels.auth_required}
            </span>
          </label>
        </div>


        {form.use_auth && (
          <div className="flex items-center gap-2">
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

        <div>
          <label className="block font-medium mb-1 text-gray-900 dark:text-gray-100">
            {locale.forms.labels.encryption}
          </label>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden w-fit">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium focus:outline-none transition ${!form.use_tls && !form.use_ssl
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
              onClick={() => handleEncryptionChange('none')}
            >
              {locale.enums.encryption.none}
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium focus:outline-none transition ${form.use_tls
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
              onClick={() => handleEncryptionChange('tls')}
            >
              {locale.enums.encryption.tls}
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium focus:outline-none transition ${form.use_ssl
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
              onClick={() => handleEncryptionChange('ssl')}
            >
              {locale.enums.encryption.ssl}
            </button>
          </div>
        </div>



        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded transition"
            >
              {testing ? locale.buttons.states.testing : locale.buttons.test}
            </button>

            {testResult && (
              <span
                className={`text-sm ${testResult.startsWith('✅')
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                  }`}
              >
                {testResult}
              </span>
            )}
          </div>


          <FormButtons
            cancelLabel={locale.buttons.cancel}
            saveLabel={locale.buttons.save}
          />

        </div>
      </form>
    </div>
  )
}