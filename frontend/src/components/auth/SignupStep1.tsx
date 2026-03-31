'use client'

import { useState } from 'react'
import { useAuthModal } from '@/stores/authModalStore'

export default function SignupStep1() {
  const { goTo, setSignupData, signupData } = useAuthModal()
  const [firstname, setFirstname] = useState(signupData.firstname ?? '')
  const [lastname, setLastname] = useState(signupData.lastname ?? '')

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    setSignupData({ firstname, lastname })
    goTo('signup-2')
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-slate-400 mb-1">Étape 1 sur 3</p>
        <h2 className="text-xl font-semibold text-slate-900">Votre identité</h2>
      </div>

      <form onSubmit={handleNext} className="space-y-4">
        <input
          placeholder="Prénom"
          value={firstname}
          required
          onChange={(e) => setFirstname(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500"
        />
        <input
          placeholder="Nom"
          value={lastname}
          required
          onChange={(e) => setLastname(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="submit"
          className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-xl py-2.5 text-sm font-medium transition-colors"
        >
          Suivant →
        </button>
      </form>
    </div>
  )
}
