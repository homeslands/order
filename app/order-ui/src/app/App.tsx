import { StrictMode, useState, useEffect } from 'react'
import { AxiosError, isAxiosError } from 'axios'
import { RouterProvider } from 'react-router-dom'
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { has } from 'lodash'

import { router } from '@/router'
import '@/i18n'
import { IApiErrorResponse, IApiResponse } from '@/types'
import { showErrorToast } from '@/utils'
import { ThemeProvider } from '@/components/app/theme-provider'
import { useGlobalTokenValidator } from '@/hooks/useGlobalTokenValidator'
import { useAuthStore, useUserStore } from '@/stores'

// Create a client
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (has(query.meta, 'ignoreGlobalError'))
        if (query.meta.ignoreGlobalError) return
      if (isAxiosError(error)) {
        const axiosError = error as AxiosError<IApiResponse<void>>
        if (axiosError.response?.data.code)
          showErrorToast(axiosError.response.data.code)
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _, __, mutation) => {
      if (has(mutation.meta, 'ignoreGlobalError'))
        if (mutation.meta.ignoreGlobalError) return
      if (isAxiosError(error)) {
        const axiosError = error as AxiosError<IApiErrorResponse>
        if (axiosError.response?.data.statusCode) {
          showErrorToast(axiosError.response?.data.statusCode)
        }
        return
      }
    },
  }),
})

function App() {
  // ✅ State để track auth initialization
  const [isAuthInitialized, setIsAuthInitialized] = useState(false)

  // Global token validator - runs once on app startup to clean expired tokens
  useGlobalTokenValidator()



  // ✅ Đảm bảo auth cleanup hoàn thành trước khi render UI
  useEffect(() => {
    // Sync cleanup expired tokens để tránh race condition
    const authStore = useAuthStore.getState()
    const userStore = useUserStore.getState()

    if (authStore.token && !authStore.isAuthenticated()) {
      authStore.setLogout()
      userStore.removeUserInfo()
    }

    // Mark initialization as complete
    setIsAuthInitialized(true)
  }, [])

  // ✅ Show loading during auth initialization to prevent race conditions
  if (!isAuthInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col gap-4 items-center">
          <div className="w-8 h-8 rounded-full border-b-2 border-blue-600 animate-spin"></div>
          <p className="text-sm text-gray-600">Initializing...</p>
        </div>
      </div>
    )
  }

  return (
    <StrictMode>
      <ThemeProvider defaultTheme="light" storageKey="my-app-theme">
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>
  )
}

export default App
