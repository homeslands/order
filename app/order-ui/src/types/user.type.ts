import { Role } from '@/constants/role'

export interface IUserInfo {
  slug: string
  image?: string
  phonenumber: string
  firstName: string
  lastName: string
  dob: string
  email: string
  address: string
  branch: {
    slug: string
    name: string
    address: string
  }
  role: {
    name: Role
    slug: string
    createdAt: string
    description: string
  }
}

export interface ICreateUserRequest {
  phonenumber: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  branch?: string
  role: string
}

export interface IUpdateUserRequest {
  slug: string
  // phonenumber: string
  firstName: string
  lastName: string
  dob: string
  email: string
  address: string
  branch?: string
}

export interface IUserQuery {
  branch?: string
  phonenumber?: string
  page: number | 1
  pageSize: number | 10
  order: 'ASC' | 'DESC'
  hasPaging?: boolean
  role?: string
}

export interface IUpdateProfileRequest {
  firstName: string
  lastName: string
  dob: string
  address: string
  branch?: string
}

export interface IUpdatePasswordRequest {
  oldPassword: string
  newPassword: string
}

export interface IUpdateUserRoleRequest {
  slug: string
  role: string
}
