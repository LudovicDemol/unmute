import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'

interface AuthStore {
  session: Session | null
  user: User | null
  setSession: (session: Session | null) => void
  clear: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  user: null,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  clear: () => set({ session: null, user: null }),
}))
