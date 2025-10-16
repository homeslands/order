import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { VerificationMethod } from '@/constants'

export interface IForgotPasswordStore {
  token: string
  step: number
  email: string
  phoneNumber: string
  verificationMethod: VerificationMethod
  setToken: (token: string) => void
  setStep: (step: number) => void
  setEmail: (email: string) => void
  setPhoneNumber: (phoneNumber: string) => void
  setVerificationMethod: (verificationMethod: VerificationMethod) => void
  clearForgotPassword: () => void
}

export const useForgotPasswordStore = create<IForgotPasswordStore>()(
  persist(
    (set) => ({
      token: '',
      step: 1,
      email: '',
      phoneNumber: '',
      verificationMethod: VerificationMethod.EMAIL,
      setToken: (token: string) => {
        set({ token })
      },
      setStep: (step: number) => {
        set({ step })
      },
      setEmail: (email: string) => {
        set({ email })
      },
      setPhoneNumber: (phoneNumber: string) => {
        set({ phoneNumber })
      },
      setVerificationMethod: (verificationMethod: VerificationMethod) => {
        set({ verificationMethod })
      },
      clearForgotPassword: () => {
        set({
          token: '',
          step: 1,
          email: '',
          phoneNumber: '',
          verificationMethod: VerificationMethod.EMAIL,
        })
      },
    }),
    {
      name: 'forgot-password-store',
    },
  ),
)
