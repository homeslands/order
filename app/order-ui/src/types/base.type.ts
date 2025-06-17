export interface IApiResponse<T> {
  code: number
  error: boolean
  message: string
  method: string
  path: string
  timestamp: number
  result: T
}

export interface IPaginationResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface IQuery {
  page: number | 1
  pageSize: number | 10
  order: 'ASC' | 'DESC'
}

export interface IBase {
  createdAt: string
  slug: string
}

export interface IApiErrorResponse {
  statusCode: number
  timestamp: boolean
  message: string
  method: string
  path: string
}
