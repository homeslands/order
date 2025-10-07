import { Role } from '@/constants/role'
import { IPermission } from './permissions.type'
import { IBase } from './base.type'

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
    addressDetail: {
      lat: number
      lng: number
    }
    slug: string
    name: string
    address: string
  }
  role: {
    name: Role
    slug: string
    createdAt: string
    description: string
    permissions: IPermission[]
  }
  isVerifiedEmail: boolean
  isVerifiedPhonenumber: boolean
}

export interface ICreateUserRequest {
  phonenumber: string
  password: string
  confirmPassword: string
  firstName?: string
  lastName?: string
  // branch?: string
  role: string
}

export interface IUpdateUserRequest {
  slug: string
  // phonenumber: string
  firstName: string
  lastName: string
  dob: string
  // email: string
  address: string
  branch?: string
}

export interface IUserQuery {
  branch?: string
  phonenumber?: string
  page: number | 1
  size: number | 10
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

export interface ICreateUserGroupRequest {
  name: string
  description?: string
}

export interface IUserGroup extends IBase {
  name: string
  description?: string
  createdBy: {
    slug: string
    firstName: string
    lastName: string
    phonenumber: string
  }
}

export interface IGetAllUserGroupRequest {
  hasPaging?: boolean
  page?: number | 1
  size?: number | 10
  sort?: string[]
  name?: string
  phonenumber?: string
}

export interface IUpdateUserGroupRequest {
  slug: string
  name: string
  description?: string
}

export interface IAddUserGroupMemberRequest {
  user: string
  userGroup: string
}

export interface IAddMultipleUserGroupMemberRequest {
  users: string[]
  userGroup: string
}

export interface IUserGroupMember extends IBase {
  user: {
    slug: string
    phonenumber: string
    firstName: string
    lastName: string
    dob: string
    email: string
    address: string
    isVerifiedEmail: boolean
    isVerifiedPhonenumber: boolean
  }
  userGroup: {
    name: string
    description: string
    createdBy: {
      slug: string
      firstName: string
      lastName: string
      phonenumber: string
    }
    slug: string
    createdAt: string
  }
  createdBy: {
    slug: string
    firstName: string
    lastName: string
    phonenumber: string
  }
}

export interface IGetUserGroupMemberRequest {
  userGroup: string
  page: number | 1
  size: number | 10
  hasPaging?: boolean
  phonenumber?: string
}
