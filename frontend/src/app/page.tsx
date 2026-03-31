
"use client"

import { useAuthModal } from '@/stores/authModalStore'
import AuthModal from '@/components/auth/AuthModal'

export default function HomePage() {
  const { openLogin } = useAuthModal()

  return (
    <main className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-xl w-full p-10 rounded-3xl bg-slate-900/80 border border-slate-800/70 shadow-blue-500/10 backdrop-blur-md flex flex-col items-center gap-6">
        <h1 className="text-4xl font-bold text-blue-400 mb-2">Bienvenue sur Unmute</h1>
        <p className="text-slate-300 text-lg text-center">Simulation médicale immersive avec IA vocale. <br/> Sélectionnez un scénario pour commencer votre session clinique.</p>

        <div className="flex gap-3">
          <button
            onClick={openLogin}
            className="px-8 py-3 rounded-2xl bg-teal-500 text-white font-semibold text-lg shadow-teal-500/20 hover:bg-teal-600 transition-all"
          >
            Se connecter
          </button>
          <a
            href="/scenarios"
            className="px-8 py-3 rounded-2xl bg-blue-500 text-white font-semibold text-lg shadow-blue-500/20 hover:bg-blue-600 transition-all"
          >
            Démarrer
          </a>
        </div>
      </div>
      <AuthModal />
    </main>
  )
}
