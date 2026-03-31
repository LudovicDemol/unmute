'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useAuthModal } from '@/stores/authModalStore'
import AuthModal from './auth/AuthModal'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const session = useAuthStore((s) => s.session)
  const user = useAuthStore((s) => s.user)
  const openLogin = useAuthModal((s) => s.openLogin)

  useEffect(() => {
    if (!session || !user) {
      openLogin()
    }
  }, [session, user, openLogin])

  if (!session || !user) {
    return (
      <>
        <AuthModal />
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
          <div className="text-center">
            <p className="text-lg">Connexion requise, merci de vous identifier.</p>
          </div>
        </div>
      </>
    )
  }

  return <>{children}</>
}
