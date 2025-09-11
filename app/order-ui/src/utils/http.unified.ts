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
import { isValidRedirectUrl } from './current-url-manager'

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

// Unified request interceptor: send token if present; otherwise send as guest
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore.getState()
    const { setCurrentUrl, shouldUpdateUrl } = useCurrentUrlStore.getState()
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
    } = authStore

    // Only attempt refresh when we actually have a token
    if (token && expireTime && isTokenExpired(expireTime) && !isRefreshing) {
      isRefreshing = true
      setIsRefreshing(true)
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
        setLogout()
        showErrorToast(1017)
        const currentUrl = window.location.pathname
        if (
          currentUrl !== ROUTE.LOGIN &&
          isValidRedirectUrl(currentUrl) &&
          shouldUpdateUrl(currentUrl)
        ) {
          setCurrentUrl(currentUrl)
        }
      } finally {
        isRefreshing = false
        setIsRefreshing(false)
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

// Response interceptor (unchanged)
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
