'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/locales/I18nContext'
import { translations } from '@/locales'
import { languageDisplayNames } from '@/locales/languageMeta'
import { fetchMe, updateMe } from '@/lib/api/me'
import PageHeader from '@/components/PageHeader'
import TextInput from '@/components/TextInput'
import SelectBox from '@/components/SelectBox'
import FormButtons from '@/components/FormButtons'
import { showError, showSuccess } from '@/lib/toast'

type Account = {
  username: string
  language: keyof typeof translations
}

export default function AccountPage() {
  const router = useRouter()
  const { lang, setLang } = useI18n()
  const availableLanguages = Object.keys(translations) as (keyof typeof translations)[]
  const [form, setForm] = useState<Account | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadAccount = async () => {
      try {
        const data = await fetchMe()

        setForm({
          username: data.username,
          language: data.language,
        })

        setLang(data.language)
      } catch (error) {
        showError('Failed to load account')
      }
    }

    loadAccount()
  }, [router, setLang])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => prev ? { ...prev, [name]: value } : prev)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return

    setSubmitting(true)
    try {
      await updateMe({
        username: form.username,
        language: form.language,
      })
      setLang(form.language)
      showSuccess('Account updated successfully')
    } catch (error: any) {
      showError(error.message || 'Failed to update account')
    } finally {
      setSubmitting(false)
    }
  }

  if (!form) return null

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader title="Account" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="Username"
          name="username"
          value={form.username}
          onChange={handleChange}
          disabled={submitting}
        />

        <SelectBox
          label="Language"
          value={form.language}
          onChange={(value) =>
            handleChange({ target: { name: 'language', value } } as React.ChangeEvent<HTMLSelectElement>)
          }
          options={availableLanguages.map((code) => ({
            value: code,
            label: languageDisplayNames[code] ?? code.toUpperCase(),
          }))}
          placeholder="Select language"
          disabled={submitting}
        />


        <FormButtons
          isSubmitting={submitting}
          hasCancel={false}
          saveLabel={'{UPDATE}'}
        />
      </form>
    </div>
  )
}
