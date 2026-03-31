'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuthModal } from '@/stores/authModalStore'
import { fetchWithAuth } from '@/lib/api'

export default function SignupStep3() {
  const { goTo, close, signupData } = useAuthModal()
  const router = useRouter()
  const [email, setEmail] = useState(signupData.email ?? '')
  const [password, setPassword] = useState(signupData.password ?? '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmationMessage, setConfirmationMessage] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      firstname: signupData.firstname,
      lastname: signupData.lastname,
      age: signupData.age ? Number(signupData.age) : null,
      school: signupData.faculty,
      grade_level: signupData.year,
    }

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: payload },
    })

    if (signupError) {
      setError(signupError.message)
      setLoading(false)
      return
    }

    try {
      await fetchWithAuth('/students', {
        method: 'POST',
        body: JSON.stringify({
          email,
          ...payload,
        }),
      })
    } catch (err) {
      console.warn('Student profile API n’est pas disponible ou a échoué :', err)
    }

    setLoading(false)
    setConfirmationMessage(
      `Bravo ! Votre compte a été créé avec succès. Vous pouvez maintenant continuer vers la page des scénarios.`
    )
  }


  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-slate-400 mb-1">Étape 3 sur 3</p>
        <h2 className="text-xl font-semibold text-slate-900">Votre compte</h2>
      </div>

      {confirmationMessage ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-teal-400/30 bg-teal-50 p-4">
            <p className="text-sm text-teal-900">{confirmationMessage}</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                close()
                router.push('/scenarios')
              }}
              className="flex-1 bg-teal-500 hover:bg-teal-600 text-white rounded-xl py-2.5 text-sm font-medium"
            >
              Continuer vers /scenarios
            </button>
            <button
              type="button"
              onClick={() => {
                close()
              }}
              className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm font-medium hover:bg-slate-50"
            >
              Fermer
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
          <input
            type="password"
            placeholder="Mot de passe (8 caractères min.)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => goTo('signup-2')}
              className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              ← Retour
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-teal-500 hover:bg-teal-600 text-white rounded-xl py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Création…' : 'Créer mon compte'}
            </button>
          </div>
        </form>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs text-slate-400 bg-white px-2">ou</div>
      </div>

     
    </div>
  )
}
