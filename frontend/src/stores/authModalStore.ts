import { create } from 'zustand'

type AuthView = 'login' | 'signup-1' | 'signup-2' | 'signup-3'

interface SignupData {
  firstname: string
  lastname: string
  age: string
  year: string
  faculty: string
  email: string
  password: string
}

interface AuthModalStore {
  open: boolean
  view: AuthView
  signupData: Partial<SignupData>
  openLogin: () => void
  openSignup: () => void
  goTo: (view: AuthView) => void
  setSignupData: (data: Partial<SignupData>) => void
  close: () => void
}

export const useAuthModal = create<AuthModalStore>((set) => ({
  open: false,
  view: 'login',
  signupData: {},
  openLogin: () => set({ open: true, view: 'login' }),
  openSignup: () => set({ open: true, view: 'signup-1' }),
  goTo: (view) => set({ view }),
  setSignupData: (data) => set((s) => ({ signupData: { ...s.signupData, ...data } })),
  close: () => set({ open: false, signupData: {}, view: 'login' }),
}))
