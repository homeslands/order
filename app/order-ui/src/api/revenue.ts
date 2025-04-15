import { http } from '@/utils'
import {
  IAllRevenueQuery,
  IApiResponse,
  IBranchRevenue,
  IBranchRevenueQuery,
  IRevenue,
  IRevenueQuery,
} from '@/types'
import { useDownloadStore } from '@/stores'
import { AxiosRequestConfig } from 'axios'
import moment from 'moment'

export async function getRevenue(
  params: IRevenueQuery,
): Promise<IApiResponse<IRevenue[]>> {
  const response = await http.get<IApiResponse<IRevenue[]>>('/revenue', {
    params,
  })
  return response.data
}

export async function getAllRevenue(
  params: IAllRevenueQuery,
): Promise<IApiResponse<IBranchRevenue[]>> {
  const response = await http.get<IApiResponse<IBranchRevenue[]>>(
    `/revenue/from-branch-revenue`,
    {
      params,
    },
  )
  return response.data
}

export async function getBranchRevenue(
  params: IBranchRevenueQuery,
): Promise<IApiResponse<IBranchRevenue[]>> {
  const response = await http.get<IApiResponse<IBranchRevenue[]>>(
    `/revenue/branch/${params.branch}`,
    {
      params,
    },
  )
  return response.data
}

// export async function getLatestRevenue(): Promise<IApiResponse<IRevenue[]>> {
//   const response = await http.patch<IApiResponse<IRevenue[]>>('/revenue/latest')
//   return response.data
// }

export async function getLatestRevenueForARange(
  params: IRevenueQuery,
): Promise<IApiResponse<IRevenue[]>> {
  const response = await http.patch<IApiResponse<IRevenue[]>>('/revenue/date', {
    params,
  })
  return response.data
}

// use for both revenue and branch revenue
export async function getLatestRevenue(): Promise<IApiResponse<void>> {
  const response = await http.patch<IApiResponse<void>>(
    `/revenue/branch/latest`,
  )
  return response.data
}

// use for both revenue and branch revenue
export async function getLatestBranchRevenueForARange(
  params: IBranchRevenueQuery,
): Promise<IApiResponse<IBranchRevenue[]>> {
  const response = await http.patch<IApiResponse<IBranchRevenue[]>>(
    `/revenue/branch/date`,
    {
      params,
    },
  )
  return response.data
}

export async function exportExcelRevenue(params: IRevenueQuery): Promise<Blob> {
  const { setProgress, setFileName, setIsDownloading, reset } =
    useDownloadStore.getState()

  const currentDate = moment().format('dd/MM/yyyy')
  setFileName(`TRENDCoffee-doanh-thu${currentDate}.xlsx`)
  setIsDownloading(true)
  try {
    const response = await http.get(`/revenue/branch/export`, {
      params,
      responseType: 'blob',
      headers: {
        Accept:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
      onDownloadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total ?? 1),
        )
        setProgress(percentCompleted)
      },
      doNotShowLoading: true,
    } as AxiosRequestConfig)

    // Create a URL for the blob
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `TRENDCoffee-doanh-thu-${currentDate}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    return response.data
  } finally {
    setIsDownloading(false)
    reset()
  }
}

export async function exportPDFRevenue(params: IRevenueQuery): Promise<Blob> {
  const { setProgress, setFileName, setIsDownloading, reset } =
    useDownloadStore.getState()
  const currentDate = new Date().toISOString()
  setFileName(`TRENDCoffee-doanh-thu-${currentDate}.pdf`)
  setIsDownloading(true)
  try {
    const response = await http.post(`/revenue/branch/export-pdf`, params, {
      responseType: 'blob',
      headers: {
        Accept: 'application/pdf',
      },
      onDownloadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total ?? 1),
        )
        setProgress(percentCompleted)
      },
      doNotShowLoading: true,
    } as AxiosRequestConfig)

    // create a url for the blob
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `TRENDCoffee-doanh-thu-${currentDate}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    return response.data
  } finally {
    setIsDownloading(false)
    reset()
  }
}
