// components/DisconnectLoginConfirmPopup.tsx
'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface DisconnectLoginConfirmPopupProps {
  visible: boolean
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export default function DisconnectLoginConfirmPopup({
  visible,
  onConfirm,
  onCancel,
}: DisconnectLoginConfirmPopupProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!visible || !mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1">
          <h2 className="text-slate-900 font-semibold text-base">
            Se déconnecter
          </h2>
          <p className="text-slate-500 text-sm">
            Vous allez être redirigé vers la page d'accueil.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2.5 text-sm font-medium transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>,
    document.body 
  )
}