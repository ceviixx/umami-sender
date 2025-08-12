'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TextInput from '@/components/inputs/TextInput'
import { updatePassword } from '@/lib/api/me'

type FormData = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ChangePasswordPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const refreshToken = localStorage.getItem('refresh_token')
    const lang = localStorage.getItem('lang')

    if (!token && !refreshToken) {
      router.replace('/login')
    } else if (token && refreshToken) {
      router.replace('/')
    } else if (token && !refreshToken && !lang) {
      setIsAllowed(true)
    } else {
      router.replace('/login')
    }
  }, [router])

  useEffect(() => {
    const timeout = setTimeout(() => setExpired(true), 10 * 60 * 1000)
    return () => clearTimeout(timeout)
  }, [])

  if (isAllowed !== true) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await updatePassword(form)
      localStorage.removeItem('token')
      router.push('/login')
    } catch (error: any) {
      if (error.message === 'UNAUTHORIZED') {
        setExpired(true)
        localStorage.removeItem('token')
        return
      }
      setError(error.message || 'An error occurred')
    } finally {
      setSubmitting(false)
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
        <h1 className="text-xl font-semibold text-center text-gray-900 dark:text-gray-100">
          Change Password
        </h1>

        {error && (
          <div className="text-sm rounded-lg p-3
                          text-red-700 dark:text-red-300
                          bg-red-500/10 dark:bg-red-500/10">
            {error}
          </div>
        )}

        {expired ? (
          <>
            <div className="text-sm rounded-lg p-3
                            text-red-700 dark:text-red-300
                            bg-red-500/10 dark:bg-red-500/10">
              Your session has expired. Please log in again.
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full rounded-lg py-2.5 px-4 font-medium
                         bg-gray-900 text-white transition
                         hover:bg-black
                         focus:outline-none focus:ring-2 focus:ring-white/30
                         dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              Back to login
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextInput
              label="Current Password"
              name="currentPassword"
              type="password"
              value={form.currentPassword}
              onChange={handleChange}
              required
              autoComplete="current-password"
              disabled={submitting}
            />
            <TextInput
              label="New Password"
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              disabled={submitting}
            />
            <TextInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 font-medium
                         bg-blue-600 text-white transition
                         hover:bg-blue-700
                         focus:outline-none focus:ring-2 focus:ring-blue-500/50
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Updating...' : 'Update'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
