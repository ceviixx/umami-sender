'use client'

import { useI18n } from "@/locales/I18nContext";
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TextInput from '@/components/inputs/TextInput'
import { login } from '@/lib/api/account'

export default function LoginPage() {
  const { locale } = useI18n()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { access_token, refresh_token, account } = await login({ username, password })
      localStorage.setItem('token', access_token)

      if (refresh_token == 'CHANGE_ME') {
        router.push('/changePassword')
        return
      }

      localStorage.setItem('refresh_token', refresh_token)
      if (account?.language) {
        localStorage.setItem('lang', account.language)
      }

      router.push('/')
    } catch (err: any) {
      try {
        const parsed = JSON.parse(err.message)
        setError(parsed?.error?.message || 'Login failed')
      } catch {
        setError(err.message || 'Login failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4
                    bg-gradient-to-br from-gray-50 to-gray-100
                    dark:from-gray-950 dark:to-gray-900">
      <div className="w-full max-w-sm space-y-6
                      rounded-2xl p-6 shadow-xl
                      bg-white/55 dark:bg-gray-900/35
                      backdrop-blur-xl">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {locale.ui.login}
          </h1>
        </div>

        {error && (
          <div className="text-sm rounded-lg p-3
                          text-red-700 dark:text-red-300
                          bg-red-500/10 dark:bg-red-500/10">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <TextInput
            type="text"
            label={locale.forms.labels.login.username}
            name="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
          <TextInput
            type="password"
            label={locale.forms.labels.login.password}
            name="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 font-medium
                       bg-blue-600 text-white transition
                       hover:bg-blue-700
                       focus:outline-none focus:ring-2 focus:ring-blue-500/50
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? locale.buttons.states.signingin : locale.buttons.signin}
          </button>
        </form>
      </div>
    </div>
  )
}
