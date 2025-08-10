'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ClientAuthGuard({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const refreshToken = localStorage.getItem('refresh_token')

    if (!token && !refreshToken) {
      router.replace('/login')
    } else if (token && !refreshToken) {
      router.replace('/changePassword')
    } else {
      setChecked(true)
    }
  }, [router])

  if (!checked) return null
  return <>{children}</>
}
