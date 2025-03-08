import { httpMock } from '../__mocks__/httpMock'
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { http } from '@/utils'
import { getAllBranches, createBranch, updateBranch, deleteBranch } from '@/api'
import { SERVER_ERROR } from '../constants'

vi.mock('@/utils', () => ({
  http: httpMock,
}))

describe('Branch API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllBranches', () => {
    it('should call get branches endpoint correctly', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              name: 'Branch 1',
              address: 'Address 1',
            },
          ],
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await getAllBranches()
      expect(http.get).toHaveBeenCalledWith('/branch')
      expect(result).toEqual(mockResponse.data)
    })

    it('should return an empty list when there are no branches', async () => {
      const mockResponse = { data: { items: [] } }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await getAllBranches()
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle server error', async () => {
      ;(http.get as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(getAllBranches()).rejects.toEqual(SERVER_ERROR)
    })
  })

  describe('createBranch', () => {
    const branchData = {
      name: 'New Branch',
      address: 'New Address',
    }

    it('should call create branch endpoint with correct data', async () => {
      const mockResponse = {
        data: {
          slug: 'new-branch',
          ...branchData,
        },
      }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      const result = await createBranch(branchData)
      expect(http.post).toHaveBeenCalledWith('/branch', branchData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle validation error', async () => {
      const mockError = {
        response: {
          status: 400,
          data: { message: 'Invalid branch data' },
        },
      }
      ;(http.post as Mock).mockRejectedValue(mockError)
      await expect(createBranch(branchData)).rejects.toEqual(mockError)
    })

    it('should throw an error when response data is missing', async () => {
      ;(http.post as Mock).mockResolvedValue(null)

      await expect(createBranch(branchData)).rejects.toThrow('No data found')
    })
  })

  describe('updateBranch', () => {
    const branchData = {
      slug: 'branch-1',
      name: 'Updated Branch',
      address: 'Updated Address',
    }

    it('should call update branch endpoint with correct data', async () => {
      const mockResponse = {
        data: {
          ...branchData,
        },
      }
      ;(http.patch as Mock).mockResolvedValue(mockResponse)

      const result = await updateBranch(branchData)
      expect(http.patch).toHaveBeenCalledWith('/branch/branch-1', branchData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle branch not found error', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Branch not found' },
        },
      }
      ;(http.patch as Mock).mockRejectedValue(mockError)
      await expect(updateBranch(branchData)).rejects.toEqual(mockError)
    })

    it('should throw an error when response data is missing on update', async () => {
      ;(http.patch as Mock).mockResolvedValue(null)

      await expect(updateBranch(branchData)).rejects.toThrow('No data found')
    })
  })

  describe('deleteBranch', () => {
    it('should call delete branch endpoint correctly', async () => {
      const mockResponse = {
        data: null,
      }
      ;(http.delete as Mock).mockResolvedValue(mockResponse)

      const result = await deleteBranch('branch-1')
      expect(http.delete).toHaveBeenCalledWith('/branch/branch-1')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle branch not found error', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Branch not found' },
        },
      }
      ;(http.delete as Mock).mockRejectedValue(mockError)
      await expect(deleteBranch('non-existent')).rejects.toEqual(mockError)
    })

    it('should handle server error during delete', async () => {
      ;(http.delete as Mock).mockRejectedValue(SERVER_ERROR)

      await expect(deleteBranch('branch-1')).rejects.toEqual(SERVER_ERROR)
    })
  })
})
