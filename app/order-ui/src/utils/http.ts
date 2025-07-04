import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import NProgress from 'nprogress'
import moment from 'moment'

import { useCurrentUrlStore, useRequestStore } from '@/stores'
import { useAuthStore } from '@/stores'
import { IApiResponse, IRefreshTokenResponse } from '@/types'
import { baseURL, ROUTE } from '@/constants'
import { useLoadingStore } from '@/stores'
import { showErrorToast } from './toast'

NProgress.configure({ showSpinner: false, trickleSpeed: 200 })

let isRefreshing = false
let failedQueue: {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}[] = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token)
    } else {
      prom.reject(error)
    }
  })
  failedQueue = []
}

const isTokenExpired = (expiryTime: string): boolean => {
  const currentDate = moment()
  const expireDate = moment(expiryTime)
  return currentDate.isAfter(expireDate)
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
})
// Public routes configuration
const publicRoutes = [
  { path: /^\/auth\/login$/, methods: ['post'] },
  { path: /^\/auth\/register$/, methods: ['post'] },
  { path: /^\/auth\/refresh$/, methods: ['post'] },
  { path: /^\/auth\/forgot-password$/, methods: ['post'] },
  { path: /^\/auth\/forgot-password\/token$/, methods: ['post'] },
  { path: /^\/orders\/public$/, methods: ['post'] },
  { path: /^\/orders\/[^/]+$/, methods: ['get'] }, // get order by slug
  { path: /^\/orders\/[^/]+\/public$/, methods: ['delete'] }, // delete order by slug
  { path: /^\/invoice\/export\/public$/, methods: ['post'] }, // export public order invoice
  { path: /^\/menu\/specific$/, methods: ['get'] },
  { path: /^\/payment\/initiate\/public$/, methods: ['post'] },
  { path: /^\/products\/[^/]+$/, methods: ['get'] }, // get product by slug
  { path: /^\/products$/, methods: ['get'] },
  { path: /^\/tables$/, methods: ['get'] },
  { path: /^\/branch$/, methods: ['get'] },
  { path: /^\/menu-item\/[^/]+$/, methods: ['get'] },
  { path: /^\/product-analysis\/top-sell\/branch\/[^/]+$/, methods: ['get'] },
  { path: /^\/catalogs$/, methods: ['get'] },
  { path: /^\/voucher\/order\/public$/, methods: ['get'] },
  { path: /^\/voucher\/specific\/public$/, methods: ['get'] },
  { path: /^\/voucher\/validate\/public$/, methods: ['post'] },
  { path: /^\/banner$/, methods: ['get'] },
  { path: /^\/static-page\/[^/]+$/, methods: ['get'] },
]

const isPublicRoute = (url: string, method: string): boolean => {
  return publicRoutes.some(
    (route) => route.path.test(url) && route.methods.includes(method),
  )
}

// Consolidated request interceptor
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore.getState()
    // const {clearCart} = useCartItemStore()
    const { setCurrentUrl } = useCurrentUrlStore.getState()
    const {
      token,
      expireTime,
      refreshToken,
      setExpireTime,
      setToken,
      setLogout,
      setRefreshToken,
      setExpireTimeRefreshToken,
      setIsRefreshing,
      isAuthenticated,
    } = authStore

    if (config.url) {
      if (isPublicRoute(config.url, config.method || '')) return config
    }

    if (!isAuthenticated()) {
      return Promise.reject(new Error('User is not authenticated'))
    }

    if (expireTime && isTokenExpired(expireTime) && !isRefreshing) {
      isRefreshing = true
      setIsRefreshing(true) // Đồng bộ với store
      try {
        const response: AxiosResponse<IApiResponse<IRefreshTokenResponse>> =
          await axios.post(`${baseURL}/auth/refresh`, {
            refreshToken,
            accessToken: token,
          })

        const newToken = response.data.result.accessToken
        setToken(newToken)
        setRefreshToken(response.data.result.refreshToken)
        setExpireTime(response.data.result.expireTime)
        setExpireTimeRefreshToken(response.data.result.expireTimeRefreshToken)
        processQueue(null, newToken)
      } catch (error) {
        processQueue(error, null)
        // clearCart()
        setLogout()
        showErrorToast(1017)
        const currentUrl = window.location.pathname
        if (currentUrl !== ROUTE.LOGIN) {
          setCurrentUrl(currentUrl)
        }
        // Không dùng window.location.href mà để React Router handle
        // window.location.href = ROUTE.LOGIN
      } finally {
        isRefreshing = false
        setIsRefreshing(false) // Đồng bộ với store
      }
    } else if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (currentToken: string) => {
            config.headers['Authorization'] = `Bearer ${currentToken}`
            resolve(config)
          },
          reject: (error: unknown) => {
            reject(error)
          },
        })
      })
    }

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
      if (!(config as CustomAxiosRequestConfig).doNotShowLoading) {
        useLoadingStore.getState().setIsLoading(true)
        const requestStore = useRequestStore.getState()
        if (requestStore.requestQueueSize === 0) {
          NProgress.start()
        }
        requestStore.incrementRequestQueueSize()
      }
    }
    return config
  },
  (error) => {
    useLoadingStore.getState().setIsLoading(false)
    return Promise.reject(error)
  },
)

// Consolidated response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    useLoadingStore.getState().setIsLoading(false)
    if (!response.config?.doNotShowLoading) setProgressBarDone()
    return response
  },
  async (error) => {
    useLoadingStore.getState().setIsLoading(false)
    if (!error.config?.doNotShowLoading) setProgressBarDone()
    return Promise.reject(error)
  },
)

async function setProgressBarDone() {
  useRequestStore.setState({
    requestQueueSize: useRequestStore.getState().requestQueueSize - 1,
  })
  if (useRequestStore.getState().requestQueueSize > 0) {
    NProgress.inc()
  } else {
    NProgress.done()
  }
}

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  doNotShowLoading?: boolean
}

export default axiosInstance
