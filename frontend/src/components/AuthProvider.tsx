// AuthProvider — importe le même client
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useEffect } from 'react'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setSession = useAuthStore(s => s.setSession)
  const clear = useAuthStore(s => s.clear)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      event === 'SIGNED_OUT' ? clear() : setSession(session)
    })

    return () => subscription.unsubscribe()
  }, []) 

  return <>{children}</>
}