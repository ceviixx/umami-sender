'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function InactivityLogout() {
  const router = useRouter()

  useEffect(() => {
    let inactivityTimeout: ReturnType<typeof setTimeout>

    const logoutUser = () => {
      localStorage.clear()
      router.push('/login')
    }

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimeout)
      inactivityTimeout = setTimeout(() => {
        logoutUser()
      }, 30 * 60 * 1000) // 20 minutes
    }
    const events = ['click', 'mousemove', 'keydown']
    events.forEach(evt => window.addEventListener(evt, resetInactivityTimer))

    resetInactivityTimer()

    return () => {
      clearTimeout(inactivityTimeout)
      events.forEach(evt => window.removeEventListener(evt, resetInactivityTimer))
    }
  }, [router])

  return null
}
