import { httpMock } from '../__mocks__/httpMock'
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { http } from '@/utils'
import {
  getAllTables,
  createTable,
  createMultipleTables,
  updateTable,
  deleteTable,
  updateTableStatus,
  getAllLocations,
} from '@/api'
import { SERVER_ERROR } from '../constants'
import { TableStatus } from '@/constants'

vi.mock('@/utils', () => ({
  http: httpMock,
}))

describe('Table API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllTables', () => {
    it('should fetch tables correctly with branch parameter', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              slug: 'table-1',
              name: 'Table 1',
              location: 'Floor 1',
              status: TableStatus.AVAILABLE,
            },
          ],
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await getAllTables('branch-1')
      expect(http.get).toHaveBeenCalledWith('/tables', {
        params: { branch: 'branch-1' },
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle server error', async () => {
      ;(http.get as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(getAllTables('branch-1')).rejects.toEqual(SERVER_ERROR)
    })
  })

  describe('createTable', () => {
    const tableData = {
      name: 'New Table',
      branch: 'branch-1',
      location: 'Floor 1',
      status: TableStatus.AVAILABLE,
    }

    it('should create table correctly', async () => {
      const mockResponse = {
        data: {
          slug: 'new-table',
          ...tableData,
        },
      }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      const result = await createTable(tableData)
      expect(http.post).toHaveBeenCalledWith('/tables', tableData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle validation error', async () => {
      const mockError = {
        response: {
          status: 400,
          data: { message: 'Invalid table data' },
        },
      }
      ;(http.post as Mock).mockRejectedValue(mockError)
      await expect(createTable(tableData)).rejects.toEqual(mockError)
    })
  })

  describe('createMultipleTables', () => {
    const bulkData = {
      branch: 'branch-1',
      from: 1,
      to: 5,
      step: 1,
    }

    it('should create multiple tables correctly', async () => {
      const mockResponse = {
        data: {
          items: Array.from({ length: 5 }, (_, i) => ({
            slug: `table-${i + 1}`,
            name: `Table ${i + 1}`,
          })),
        },
      }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      const result = await createMultipleTables(bulkData)
      expect(http.post).toHaveBeenCalledWith('/tables/bulk', bulkData)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('updateTable', () => {
    const updateData = {
      slug: 'table-1',
      name: 'Updated Table',
      location: 'Floor 2',
    }

    it('should update table correctly', async () => {
      const mockResponse = {
        data: {
          ...updateData,
        },
      }
      ;(http.patch as Mock).mockResolvedValue(mockResponse)

      const result = await updateTable(updateData)
      expect(http.patch).toHaveBeenCalledWith('/tables/table-1', updateData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle table not found', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Table not found' },
        },
      }
      ;(http.patch as Mock).mockRejectedValue(mockError)
      await expect(updateTable(updateData)).rejects.toEqual(mockError)
    })
  })

  describe('updateTableStatus', () => {
    const statusData = {
      slug: 'table-1',
      status: TableStatus.RESERVED,
    }

    it('should update table status correctly', async () => {
      const mockResponse = {
        data: {
          slug: 'table-1',
          status: TableStatus.RESERVED,
        },
      }
      ;(http.patch as Mock).mockResolvedValue(mockResponse)

      const result = await updateTableStatus(statusData)
      expect(http.patch).toHaveBeenCalledWith('/tables/table-1/status', {
        status: statusData.status,
      })
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('deleteTable', () => {
    it('should delete table correctly', async () => {
      const mockResponse = {
        data: null,
      }
      ;(http.delete as Mock).mockResolvedValue(mockResponse)

      const result = await deleteTable('table-1')
      expect(http.delete).toHaveBeenCalledWith('/tables/table-1')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle table not found error', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Table not found' },
        },
      }
      ;(http.delete as Mock).mockRejectedValue(mockError)
      await expect(deleteTable('non-existent')).rejects.toEqual(mockError)
    })
  })

  describe('getAllLocations', () => {
    it('should fetch locations correctly', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              id: 'loc-1',
              name: 'Floor 1',
              qr_code: 'qr-code-1',
              createdAt: '2024-01-01',
            },
          ],
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await getAllLocations()
      expect(http.get).toHaveBeenCalledWith('/tables/locations')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle server error', async () => {
      ;(http.get as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(getAllLocations()).rejects.toEqual(SERVER_ERROR)
    })
  })
})
