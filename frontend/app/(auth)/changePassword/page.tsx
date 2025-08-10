'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TextInput from '@/components/TextInput'
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

  const [timeLeft, setTimeLeft] = useState(10 * 60)
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
    const timeout = setTimeout(() => {
      setExpired(true)
    }, 10 * 60 * 1000)

    return () => clearTimeout(timeout)
  }, [])


  if (isAllowed !== true) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await updatePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      })
      localStorage.removeItem('token')
      router.push('/login')
    } catch (error: any) {
      if (error.message == 'UNAUTHORIZED') {
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
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-sm space-y-6">

        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {'Change Password'}
          </h1>
        </div>


        {error && (
          <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 p-2 rounded">
            {error}
          </div>
        )}

        {expired ? (
          <>
            <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 p-2 rounded">
              Your session has expired. Please log in again.
            </div>

            <button
              type="button"
              className="w-full rounded py-2.5 px-4 font-medium transition
              bg-black hover:bg-gray-900 text-white
              focus:outline-none focus:ring-2 focus:ring-black/50 dark:focus:ring-white/30
              disabled:opacity-50 disabled:cursor-not-allowed"
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
            />

            <TextInput
              label="New Password"
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
            />

            <TextInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded py-2.5 px-4 font-medium transition
                bg-black hover:bg-gray-900 text-white
                focus:outline-none focus:ring-2 focus:ring-black/50 dark:focus:ring-white/30
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Updating ...' : 'Update'}
            </button>
          </form>
        )}

      </div>
    </div>
  )
}
