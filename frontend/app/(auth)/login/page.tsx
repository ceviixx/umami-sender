'use client'

import { useI18n } from "@/locales/I18nContext";
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TextInput from '@/components/TextInput'
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
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {'Login'}
          </h1>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 p-2 rounded">
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
          />
          <TextInput
            type="password"
            label={locale.forms.labels.login.password}
            name="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded py-2.5 px-4 font-medium transition
              bg-black hover:bg-gray-900 text-white
              focus:outline-none focus:ring-2 focus:ring-black/50 dark:focus:ring-white/30
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? locale.buttons.states.signingin : locale.buttons.signin}
          </button>

        </form>
      </div>
    </div>
  )

}