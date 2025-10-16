import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { IForgotPasswordStore } from '@/types'
import { VerificationMethod } from '@/constants'

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
