'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export function SessionWatcher() {
  const router = useRouter()

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        router.refresh()
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [router])

  return null
}