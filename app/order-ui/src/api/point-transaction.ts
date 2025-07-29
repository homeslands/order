import { AxiosRequestConfig } from 'axios'
import { http } from '@/utils'
import {
  IApiResponse,
  IPaginationResponse,
  IPointTransaction,
  IPointTransactionQuery,
} from '@/types'
import { useDownloadStore } from '@/stores'

export async function getPointTransactions(
  params: IPointTransactionQuery | null,
): Promise<IApiResponse<IPaginationResponse<IPointTransaction>>> {
  const response = await http.get<
    IApiResponse<IPaginationResponse<IPointTransaction>>
  >('/point-transaction', {
    params,
  })
  return response.data
}

// Export all point transactions for a user
export async function exportAllPointTransactions(
  userSlug: string,
  fromDate: string | undefined,
  toDate: string | undefined,
  type: string | undefined,
): Promise<Blob> {
  const { setProgress, setFileName, setIsDownloading, reset } =
    useDownloadStore.getState()

  const currentDate = new Date().toISOString().split('T')[0]
  setFileName(`point-transactions-${userSlug}-${currentDate}.pdf`)
  setIsDownloading(true)

  try {
    const response = await http.get(`/point-transaction/export`, {
      params: {
        userSlug,
        fromDate,
        toDate,
        type,
      },
      responseType: 'blob',
      headers: {
        Accept:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
      onDownloadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          )
          setProgress(percentCompleted)
        }
      },
      doNotShowLoading: true,
    } as AxiosRequestConfig)

    return response.data
  } finally {
    setIsDownloading(false)
    reset()
  }
}

// Export single point transaction by slug
export async function exportPointTransactionBySlug(
  slug: string,
): Promise<Blob> {
  const { setProgress, setFileName, setIsDownloading, reset } =
    useDownloadStore.getState()

  const currentDate = new Date().toISOString().split('T')[0]
  setFileName(`transaction-${slug}-${currentDate}.pdf`)
  setIsDownloading(true)

  try {
    const response = await http.get(`/point-transaction/${slug}/export`, {
      responseType: 'blob',
      headers: {
        Accept:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
      onDownloadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          )
          setProgress(percentCompleted)
        }
      },
      doNotShowLoading: true,
    } as AxiosRequestConfig)

    return response.data
  } finally {
    setIsDownloading(false)
    reset()
  }
}
