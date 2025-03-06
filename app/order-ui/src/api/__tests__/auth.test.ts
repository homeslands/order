import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { http } from '@/utils'
import {
  login,
  register,
  forgotPasswordAndGetToken,
  forgotPasswordAndResetPassword,
  verifyEmail,
  confirmEmailVerification,
} from '../auth'

vi.mock('@/utils', () => ({
  http: {
    post: vi.fn(),
  },
}))

describe('Auth API', () => {
  const serverError = {
    response: {
      status: 500,
      data: { message: 'Internal Server Error' },
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should call login endpoint with correct parameters', async () => {
      const mockResponse = { data: { token: 'test-token', user: { id: 1 } } }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      const loginParams = { phonenumber: '1234567890', password: 'password123' }
      const result = await login(loginParams)

      expect(http.post).toHaveBeenCalledWith('/auth/login', loginParams)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle login failure (401 Unauthorized)', async () => {
      const mockResponse = {
        response: { status: 401, data: { message: 'Unauthorized' } },
      }
      ;(http.post as Mock).mockRejectedValue(mockResponse)

      const loginParams = { phonenumber: '1234567890', password: 'password123' }

      await expect(login(loginParams)).rejects.toEqual(mockResponse)
    })

    it('should handle server error (500 Internal Server Error)', async () => {
      const mockError = {
        response: {
          status: 500,
          data: { message: 'Server error' },
        },
      }
      ;(http.post as Mock).mockRejectedValue(mockError)

      const loginParams = { phonenumber: '1234567890', password: 'password123' }

      await expect(login(loginParams)).rejects.toEqual(mockError)
    })

    it('should handle login error response', async () => {
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Invalid credentials' },
        },
      }
      ;(http.post as Mock).mockRejectedValue(mockError)

      const loginParams = {
        phonenumber: '1234567890',
        password: 'wrong-password',
      }
      await expect(login(loginParams)).rejects.toEqual(mockError)
    })

    it('should handle network error', async () => {
      const networkError = new Error('Network Error')
      ;(http.post as Mock).mockRejectedValue(networkError)

      const loginParams = { phonenumber: '1234567890', password: 'password123' }

      await expect(login(loginParams)).rejects.toEqual(networkError)
    })
  })

  describe('register', () => {
    it('should call register endpoint with correct parameters', async () => {
      const mockResponse = { data: { success: true } }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      const registerParams = {
        phonenumber: '1234567890',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      }
      const result = await register(registerParams)

      expect(http.post).toHaveBeenCalledWith('/auth/register', registerParams)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle register error response', async () => {
      const mockError = {
        response: {
          status: 400,
          data: { message: 'Phone number already exists' },
        },
      }
      ;(http.post as Mock).mockRejectedValue(mockError)

      const registerParams = {
        phonenumber: '1234567890',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      }
      await expect(register(registerParams)).rejects.toEqual(mockError)
    })

    it('should handle server error', async () => {
      ;(http.post as Mock).mockRejectedValue(serverError)
      const registerParams = {
        phonenumber: '1234567890',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      }
      await expect(register(registerParams)).rejects.toEqual(serverError)
    })
  })

  describe('forgotPasswordAndGetToken', () => {
    it('should call forgot password token endpoint', async () => {
      const mockResponse = { data: { success: true } }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      const email = { email: 'test@example.com' }
      const result = await forgotPasswordAndGetToken(email)

      expect(http.post).toHaveBeenCalledWith(
        '/auth/forgot-password/token',
        email,
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle forgot password token error response', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Email not found' },
        },
      }
      ;(http.post as Mock).mockRejectedValue(mockError)

      const email = { email: 'nonexistent@example.com' }
      await expect(forgotPasswordAndGetToken(email)).rejects.toEqual(mockError)
    })

    it('should handle server error', async () => {
      ;(http.post as Mock).mockRejectedValue(serverError)
      const email = { email: 'test@example.com' }
      await expect(forgotPasswordAndGetToken(email)).rejects.toEqual(
        serverError,
      )
    })
  })

  describe('forgotPasswordAndResetPassword', () => {
    it('should call reset password endpoint with token and new password', async () => {
      const mockResponse = { data: { success: true } }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      const resetData = { newPassword: 'newpass123', token: 'reset-token' }
      const result = await forgotPasswordAndResetPassword(resetData)

      expect(http.post).toHaveBeenCalledWith('/auth/forgot-password', resetData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle reset password error response', async () => {
      const mockError = {
        response: {
          status: 400,
          data: { message: 'Invalid or expired token' },
        },
      }
      ;(http.post as Mock).mockRejectedValue(mockError)

      const resetData = { newPassword: 'newpass123', token: 'invalid-token' }
      await expect(forgotPasswordAndResetPassword(resetData)).rejects.toEqual(
        mockError,
      )
    })

    it('should handle server error', async () => {
      ;(http.post as Mock).mockRejectedValue(serverError)
      const resetData = { newPassword: 'newpass123', token: 'reset-token' }
      await expect(forgotPasswordAndResetPassword(resetData)).rejects.toEqual(
        serverError,
      )
    })
  })

  describe('verifyEmail', () => {
    it('should call verify email endpoint', async () => {
      const mockResponse = { data: { success: true } }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      const verifyParams = {
        email: 'test@example.com',
        accessToken: 'test-access-token', // Add required accessToken
      }
      const result = await verifyEmail(verifyParams)

      expect(http.post).toHaveBeenCalledWith(
        '/auth/request-verify-email',
        verifyParams,
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle verify email error response', async () => {
      const mockError = {
        response: {
          status: 403,
          data: { message: 'Invalid access token' },
        },
      }
      ;(http.post as Mock).mockRejectedValue(mockError)

      const verifyParams = {
        email: 'test@example.com',
        accessToken: 'invalid-token',
      }
      await expect(verifyEmail(verifyParams)).rejects.toEqual(mockError)
    })

    it('should handle server error', async () => {
      ;(http.post as Mock).mockRejectedValue(serverError)
      const verifyParams = {
        email: 'test@example.com',
        accessToken: 'test-token',
      }
      await expect(verifyEmail(verifyParams)).rejects.toEqual(serverError)
    })
  })

  describe('confirmEmailVerification', () => {
    it('should call confirm email verification endpoint', async () => {
      const mockResponse = { data: { success: true } }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      const confirmParams = { token: 'verify-token', email: 'test@example.com' }
      const result = await confirmEmailVerification(confirmParams)

      expect(http.post).toHaveBeenCalledWith(
        '/auth/confirm-email-verification',
        confirmParams,
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle confirm email verification error response', async () => {
      const mockError = {
        response: {
          status: 400,
          data: { message: 'Verification token expired' },
        },
      }
      ;(http.post as Mock).mockRejectedValue(mockError)

      const confirmParams = {
        token: 'expired-token',
        email: 'test@example.com',
      }
      await expect(confirmEmailVerification(confirmParams)).rejects.toEqual(
        mockError,
      )
    })

    it('should handle network error', async () => {
      const mockError = new Error('Network Error')
      ;(http.post as Mock).mockRejectedValue(mockError)

      const confirmParams = { token: 'test-token', email: 'test@example.com' }
      await expect(confirmEmailVerification(confirmParams)).rejects.toEqual(
        mockError,
      )
    })

    it('should handle server error', async () => {
      ;(http.post as Mock).mockRejectedValue(serverError)
      const confirmParams = { token: 'verify-token', email: 'test@example.com' }
      await expect(confirmEmailVerification(confirmParams)).rejects.toEqual(
        serverError,
      )
    })
  })
})
