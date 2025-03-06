import { http } from '@/utils'
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
