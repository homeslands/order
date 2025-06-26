import { http } from '@/utils'
import {
  IApiResponse,
  IPaginationResponse,
  IPointTransaction,
  IPointTransactionQuery,
} from '@/types'

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
