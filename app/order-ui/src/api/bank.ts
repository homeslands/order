import { http } from '@/utils'
// import { AxiosError } from 'axios'
import {
  IApiResponse,
  IBankConnector,
  ICreateBankConnectorRequest,
  IUpdateBankConnectorRequest,
} from '@/types'

export async function getBankConnector(): Promise<
  IApiResponse<IBankConnector>
> {
  const response =
    await http.get<IApiResponse<IBankConnector>>('/acb-connector')
  if (!response || !response.data) throw new Error('No data found')
  return response.data
}
// export async function getBankConnector() {
//   try {
//     const response = await http.get('/acb-connector')
//     if (!response || !response.data) throw new Error('No data found')
//     return response.data
//   } catch (error: unknown) {
//     if (error instanceof AxiosError && error.response) {
//       throw error // Giữ nguyên lỗi từ server (500, 404, etc.)
//     } else if (error instanceof Error) {
//       if (error.message === 'No response') {
//         throw new Error('No response') // Lỗi request không nhận được phản hồi
//       } else if (error.name === 'TimeoutError') {
//         throw new Error('Request timeout') // Timeout request
//       } else if (error.message === 'Network Error') {
//         throw new Error('Network Error') // Lỗi kết nối mạng
//       }
//     }
//     throw new Error('Unexpected error') // Lỗi không xác định
//   }
// }

export async function createBankConnector(
  data: ICreateBankConnectorRequest,
): Promise<IApiResponse<IBankConnector>> {
  const response = await http.post<IApiResponse<IBankConnector>>(
    `/acb-connector`,
    data,
  )
  if (!response || !response.data) throw new Error('No data found')
  return response.data
}

export async function updateBankConnector(
  data: IUpdateBankConnectorRequest,
): Promise<IApiResponse<IBankConnector>> {
  const response = await http.put<IApiResponse<IBankConnector>>(
    `/acb-connector/${data.slug}`,
    data,
  )
  if (!response || !response.data) throw new Error('No data found')
  return response.data
}
