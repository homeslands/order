import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { IUserStore, IUserInfo } from '@/types'

export const useUserStore = create<IUserStore>()(
  persist(
    (set, get) => ({
      userInfo: null,
      emailVerificationStatus: null,
      isVerifyingEmail: false,
      setUserInfo: (userInfo: IUserInfo) => {
        set({ userInfo })
      },
      getUserInfo: () => get().userInfo,
      removeUserInfo: () => set({ userInfo: null }),
      setIsVerifyingEmail: (isVerifyingEmail: boolean) =>
        set({ isVerifyingEmail }),
      getIsVerifyingEmail: () => get().isVerifyingEmail,
      setEmailVerificationStatus: (
        emailVerificationStatus: {
          expiresAt: string // ISO string timestamp when OTP expires
          slug?: string // verification slug from response
        } | null,
      ) => set({ emailVerificationStatus }),
      getEmailVerificationStatus: () => get().emailVerificationStatus,
    }),
    {
      name: 'user-info',
    },
  ),
)
