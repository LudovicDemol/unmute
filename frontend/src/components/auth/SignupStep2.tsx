'use client'

import { useState } from 'react'
import { useAuthModal } from '@/stores/authModalStore'

const FACULTIES = [
  'Paris Cité', 'Sorbonne', 'Paris-Saclay', 'Lyon Est', 'Lyon Sud',
  'Marseille', 'Bordeaux', 'Toulouse', 'Lille', 'Strasbourg',
  'Nantes', 'Rennes', 'Montpellier', 'Nice', 'Grenoble', 'Autre',
]

const YEARS = ['PASS', 'LAS', 'D1 (2e année)', 'D2 (3e année)', 'D3 (4e année)', 'D4 (5e année)', 'D5 (6e année)', 'Autre']

export default function SignupStep2() {
  const { goTo, setSignupData, signupData } = useAuthModal()
  const [age, setAge] = useState(signupData.age ?? '')
  const [year, setYear] = useState(signupData.year ?? '')
  const [faculty, setFaculty] = useState(signupData.faculty ?? '')

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    setSignupData({ age, year, faculty })
    goTo('signup-3')
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-slate-400 mb-1">Étape 2 sur 3</p>
        <h2 className="text-xl font-semibold text-slate-900">Votre cursus</h2>
      </div>

      <form onSubmit={handleNext} className="space-y-4">
        <input
          type="number"
          placeholder="Âge"
          value={age}
          required
          min={17}
          max={40}
          onChange={(e) => setAge(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500"
        />

        <select
          value={year}
          required
          onChange={(e) => setYear(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white"
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
          required
          onChange={(e) => setFaculty(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white"
        >
          <option value="">Faculté</option>
          {FACULTIES.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => goTo('signup-1')}
            className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            ← Retour
          </button>
          <button
            type="submit"
            className="flex-1 bg-teal-500 hover:bg-teal-600 text-white rounded-xl py-2.5 text-sm font-medium transition-colors"
          >
            Suivant →
          </button>
        </div>
      </form>
    </div>
  )
}
