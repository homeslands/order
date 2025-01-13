import { StrictMode } from 'react'
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
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>
  )
}

export default App
