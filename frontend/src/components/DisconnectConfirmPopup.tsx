// components/DisconnectConfirmPopup.tsx
"use client"
import { LogOut, AlertTriangle } from "lucide-react"

interface DisconnectConfirmPopupProps {
  visible: boolean
  willBeEvaluated: boolean 
  onConfirm: () => void
  onCancel: () => void
}

export default function DisconnectConfirmPopup({
  visible,
  onConfirm,
  onCancel,
  willBeEvaluated,
}: DisconnectConfirmPopupProps) {
  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-slate-900 font-semibold text-base">
                Terminer la session ?
              </h2>
              <p className="text-slate-500 text-sm">
                Cette action est irréversible
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <p className="text-slate-600 text-sm leading-relaxed">
            {willBeEvaluated ? (
                <>
                La session sera terminée et{" "}
                <span className="font-medium text-slate-800">
                    vos résultats seront évalués
                </span>
                . Vous pouvez consulter votre score dans l'historique.
                </>
            ) : (
                <>
                La session sera abandonnée et{" "}
                <span className="font-medium text-slate-800">
                    aucun résultat ne sera enregistré
                </span>
                {" "}(session trop courte — minimum 2 minutes).
                </>
            )}
        </p>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Continuer la session
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Quitter
          </button>
        </div>

      </div>
    </div>
  )
}