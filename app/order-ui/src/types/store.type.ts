import { PaymentMethod } from '@/constants'
import { IBranch } from './branch.type'
import { ICatalog } from './catalog.type'
import { IUserInfo } from './user.type'

export interface IAuthStore {
  slug?: string
  token?: string
  refreshToken?: string
  expireTime?: string
  expireTimeRefreshToken?: string
  authorities?: string[]
  isAuthenticated: () => boolean
  setSlug: (slug: string) => void
  setToken: (token: string) => void
  setRefreshToken: (refreshToken: string) => void
  setExpireTime: (expireTime: string) => void
  setExpireTimeRefreshToken: (expireTimeRefreshToken: string) => void
  setLogout: () => void
}

export interface IBranchStore {
  branch?: IBranch
  setBranch: (branch?: IBranch) => void
  removeBranch: () => void
}

export interface ICatalogStore {
  catalog?: ICatalog
  setCatalog: (catalog?: ICatalog) => void
  removeCatalog: () => void
}

export interface IProductNameStore {
  productName?: string
  setProductName: (productName?: string) => void
  removeProductName: () => void
}

export interface IRequestDishStore {
  requestQueueSize: number
  incrementRequestQueueSize: () => void
  decrementRequestQueueSize: () => void
}

export interface IThemeStore {
  theme: string
  setTheme: (theme: string) => void
  getTheme: () => string
}

export interface IUserStore {
  userInfo: IUserInfo | null
  setUserInfo: (userInfo: IUserInfo) => void
  isVerifyingEmail: boolean
  emailVerificationStatus: {
    startedAt: number // timestamp
  } | null
  setEmailVerificationStatus: (
    emailVerificationStatus: {
      startedAt: number // timestamp
    } | null,
  ) => void
  getEmailVerificationStatus: () => {
    startedAt: number // timestamp
  } | null
  getUserInfo: () => IUserInfo | null
  getIsVerifyingEmail: () => boolean
  setIsVerifyingEmail: (isVerifyingEmail: boolean) => void
  removeUserInfo: () => void
}

export interface IPaymentMethodStore {
  paymentMethod: PaymentMethod
  setPaymentMethod: (paymentMethod: PaymentMethod) => void
  qrCode: string
  setQrCode: (qrCode: string) => void
  paymentSlug: string
  setPaymentSlug: (paymentSlug: string) => void
  clearStore: () => void
}

export interface IPaymentStore {
  orderSlug: string
  setOrderSlug: (orderSlug: string) => void
  clearStore: () => void
}
