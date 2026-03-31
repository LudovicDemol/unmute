'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const FACULTIES = [
  'Paris Cité', 'Sorbonne', 'Paris-Saclay', 'Lyon Est', 'Lyon Sud',
  'Marseille', 'Bordeaux', 'Toulouse', 'Lille', 'Strasbourg',
  'Nantes', 'Rennes', 'Montpellier', 'Nice', 'Grenoble',
]

const YEARS = ['PASS', 'LAS', 'D1 (2e année)', 'D2 (3e année)', 'D3 (4e année)', 'D4 (5e année)', 'D5 (6e année)']

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [age, setAge] = useState('')
  const [year, setYear] = useState('')
  const [faculty, setFaculty] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const meta = user.user_metadata as any
      setFirstname(meta?.firstname ?? '')
      setLastname(meta?.lastname ?? '')
      setAge(meta?.age ? String(meta.age) : '')
      setYear(meta?.year ?? '')
      setFaculty(meta?.faculty ?? '')
      setLoading(false)
    }

    load()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const { error } = await supabase.auth.updateUser({
      data: { firstname, lastname, age, year, faculty },
    })

    if (error) {
      setError(error.message)
      return
    }

    router.push('/scenarios')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Chargement...</div>
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
      <div className="max-w-md w-full bg-slate-900/90 rounded-3xl p-8 shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Complétez votre profil</h1>
        <p className="text-sm text-slate-300 mb-6">Les informations de cursus sont nécessaires pour continuer.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            placeholder="Prénom"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            required
            className="w-full border border-slate-700 rounded-xl px-3 py-2 bg-slate-800 text-white"
          />
          <input
            placeholder="Nom"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            required
            className="w-full border border-slate-700 rounded-xl px-3 py-2 bg-slate-800 text-white"
          />
          <input
            type="number"
            placeholder="Âge"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
            min={17}
            max={40}
            className="w-full border border-slate-700 rounded-xl px-3 py-2 bg-slate-800 text-white"
          />
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
            className="w-full border border-slate-700 rounded-xl px-3 py-2 bg-slate-800 text-white"
          >
            <option value="">Année de cursus</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select
            value={faculty}
            onChange={(e) => setFaculty(e.target.value)}
            required
            className="w-full border border-slate-700 rounded-xl px-3 py-2 bg-slate-800 text-white"
          >
            <option value="">Faculté</option>
            {FACULTIES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button className="w-full bg-teal-500 hover:bg-teal-600 text-slate-900 py-2.5 rounded-xl font-medium">
            Enregistrer et continuer
          </button>
        </form>
      </div>
    </main>
  )
}
