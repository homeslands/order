import { httpMock } from '../__mocks__/httpMock'
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { http } from '@/utils'
import {
  getUsers,
  resetPassword,
  updateUserRole,
  createUser,
  updateUser,
} from '@/api'
import { SERVER_ERROR } from '../constants'
import { Role } from '@/constants/role'

vi.mock('@/utils', () => ({
  http: httpMock,
}))

describe('User API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUsers', () => {
    const queryParams = {
      branch: 'branch-1',
      page: 1,
      pageSize: 10,
      order: 'DESC' as const,
      role: 'admin',
    }

    it('should fetch users correctly with parameters', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              slug: 'user-1',
              firstName: 'John',
              lastName: 'Doe',
              phonenumber: '1234567890',
              branch: {
                slug: 'branch-1',
                name: 'Main Branch',
              },
              role: {
                name: Role.ADMIN,
                slug: 'admin',
              },
            },
          ],
          meta: {
            page: 1,
            total: 1,
          },
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await getUsers(queryParams)
      expect(http.get).toHaveBeenCalledWith('/user', { params: queryParams })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle server error', async () => {
      ;(http.get as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(getUsers(null)).rejects.toEqual(SERVER_ERROR)
    })
  })

  describe('resetPassword', () => {
    it('should reset user password correctly', async () => {
      const mockResponse = {
        data: null,
      }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      const result = await resetPassword('user-1')
      expect(http.post).toHaveBeenCalledWith('/user/user-1/reset-password')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle user not found error', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'User not found' },
        },
      }
      ;(http.post as Mock).mockRejectedValue(mockError)
      await expect(resetPassword('non-existent')).rejects.toEqual(mockError)
    })
  })

  describe('updateUserRole', () => {
    it('should update user role correctly', async () => {
      const mockResponse = {
        data: null,
      }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      const result = await updateUserRole('user-1', 'admin')
      expect(http.post).toHaveBeenCalledWith('/user/user-1/role', {
        role: 'admin',
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle invalid role error', async () => {
      const mockError = {
        response: {
          status: 400,
          data: { message: 'Invalid role' },
        },
      }
      ;(http.post as Mock).mockRejectedValue(mockError)
      await expect(updateUserRole('user-1', 'invalid-role')).rejects.toEqual(
        mockError,
      )
    })
  })

  describe('createUser', () => {
    const userData = {
      phonenumber: '1234567890',
      password: 'password123',
      confirmPassword: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      branch: 'branch-1',
      role: 'admin',
    }

    it('should create user correctly', async () => {
      const mockResponse = {
        data: {
          slug: 'new-user',
          phonenumber: userData.phonenumber,
          firstName: userData.firstName,
          lastName: userData.lastName,
          branch: { slug: userData.branch },
          role: { slug: userData.role },
        },
      }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      const result = await createUser(userData)
      expect(http.post).toHaveBeenCalledWith('/user', userData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle validation error', async () => {
      const mockError = {
        response: {
          status: 400,
          data: { message: 'Password mismatch' },
        },
      }
      ;(http.post as Mock).mockRejectedValue(mockError)
      await expect(createUser(userData)).rejects.toEqual(mockError)
    })
  })

  describe('updateUser', () => {
    const updateData = {
      slug: 'user-1',
      firstName: 'John',
      lastName: 'Smith',
      dob: '1990-01-01',
      email: 'john@example.com',
      address: 'New Address',
      branch: 'branch-2',
    }

    it('should update user correctly', async () => {
      const mockResponse = {
        data: {
          ...updateData,
          branch: { slug: updateData.branch },
        },
      }
      ;(http.patch as Mock).mockResolvedValue(mockResponse)

      const result = await updateUser(updateData)
      expect(http.patch).toHaveBeenCalledWith('/user/user-1', updateData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle user not found error', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'User not found' },
        },
      }
      ;(http.patch as Mock).mockRejectedValue(mockError)
      await expect(updateUser(updateData)).rejects.toEqual(mockError)
    })

    it('should handle server error during update', async () => {
      ;(http.patch as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(updateUser(updateData)).rejects.toEqual(SERVER_ERROR)
    })
  })
})
