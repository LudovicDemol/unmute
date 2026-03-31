'use client'

import { useAuthModal } from '@/stores/authModalStore'
import LoginForm from './LoginForm'
import SignupStep1 from './SignupStep1'
import SignupStep2 from './SignupStep2'
import SignupStep3 from './SignupStep3'

export default function AuthModal() {
  const { open, view, close } = useAuthModal()
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {view === 'login' && <LoginForm />}
        {view === 'signup-1' && <SignupStep1 />}
        {view === 'signup-2' && <SignupStep2 />}
        {view === 'signup-3' && <SignupStep3 />}
      </div>
    </div>
  )
}
