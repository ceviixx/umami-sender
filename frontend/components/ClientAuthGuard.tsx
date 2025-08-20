'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/session/SessionContext'

type Props = {
  children: React.ReactNode
  requireAdmin?: boolean
  adminFallback?: string
}

export default function ClientAuthGuard({
  children,
  requireAdmin = false,
  adminFallback = '/account',
}: Props) {
  const router = useRouter()
  const { user, loading } = useSession()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const refresh = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null

      if (!token && !refresh) {
        if (!cancelled) router.replace('/login')
        return
      }

      if (token && !refresh) {
        if (!cancelled) router.replace('/changePassword')
        return
      }

      if (requireAdmin) {
        if (loading) return

        if (!user) {
          if (!cancelled) router.replace('/login')
          return
        }

        const role = String(user.role ?? '').toLowerCase()
        if (role !== 'admin') {
          if (!cancelled) router.replace(adminFallback)
          return
        }
      }

      if (!cancelled) setReady(true)
    }

    run()
    return () => { cancelled = true }
  }, [router, requireAdmin, adminFallback, loading, user])

  if (!ready) return null
  return <>{children}</>
}
