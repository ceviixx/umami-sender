'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/locales/I18nContext'
import { translations } from '@/locales'
import { languageDisplayNames } from '@/locales/languageMeta'
import { fetchMe, updateMe } from '@/lib/api/me'
import PageHeader from '@/components/navigation/PageHeader'
import TextInput from '@/components/inputs/TextInput'
import SelectBox from '@/components/inputs/SelectBox'
import FormButtons from '@/components/FormButtons'
import { showError, showSuccess, notification_ids } from '@/lib/toast'
import Container from '@/components/layout/Container'
import { useSession } from '@/lib/session/SessionContext'

type Account = {
  username: string
  language: keyof typeof translations
}

export default function AccountPage() {
  const router = useRouter()
  const { locale } = useI18n()
  const { lang, setLang } = useI18n()
  const availableLanguages = Object.keys(translations) as (keyof typeof translations)[]
  const [form, setForm] = useState<Account | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { user, setUser } = useSession()
  const [successPending, setSuccessPending] = useState(false)

  useEffect(() => {
    const loadAccount = async () => {
      try {
        const data = await fetchMe()
        setForm({
          username: data.username,
          language: data.language,
        })
        setLang(data.language)
      } catch (error: any) {
        showError({id: notification_ids.account, title: locale.messages.title.error, description: error.message})
      }
    }
    loadAccount()
  }, [router, setLang])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => prev ? { ...prev, [name]: value as any } : prev)
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
      if (typeof setUser === 'function' && user) {
        setUser({ ...user, username: form.username })
      }
      setSuccessPending(true)
    } catch (error: any) {
      showError({id: notification_ids.account, title: locale.messages.title.error, description: error.message})
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (successPending) {
      showSuccess({
        id: notification_ids.account,
        title: locale.messages.title.success,
        description: 'Account updated successfully'
      })
      setSuccessPending(false)
    }
  }, [lang, locale, successPending])

  if (!form) return null

  return (
    <Container>
      <PageHeader title="Account" />

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="rounded-2xl border border-gray-200/70 dark:border-gray-800/60 bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm shadow-sm">
          <div className="px-5 pt-5 pb-1">
            <h2 className="text-sm font-semibold tracking-wide text-gray-900 dark:text-gray-100">
              {locale.forms.sections.profile}
            </h2>
          </div>

          <div className="px-5 pb-5 space-y-4">
            <TextInput
              label={locale.forms.labels.username}
              name="username"
              value={form.username}
              onChange={handleChange}
              disabled={submitting}
              autoComplete="username"
              required
            />

            <SelectBox
              label={locale.forms.labels.language}
              value={form.language}
              onChange={(value) =>
                handleChange({ target: { name: 'language', value } } as React.ChangeEvent<HTMLSelectElement>)
              }
              options={availableLanguages.map((code) => ({
                value: code,
                label: languageDisplayNames[code] ?? code.toUpperCase(),
              }))}
              placeholder={locale.forms.placeholders.choose_language}
              disabled={submitting}
            />

            <p className="text-xs text-gray-500 dark:text-gray-400"></p>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200/70 dark:border-gray-800/60 bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4">
            <p className="text-xs text-gray-500 dark:text-gray-400"></p>
            <FormButtons
              isSubmitting={submitting}
              hasCancel={false}
              saveLabel={locale.buttons.update}
            />
          </div>
        </section>
      </form>
    </Container>
  )
}
