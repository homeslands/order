import { IBase } from './base.type'

export interface IAllNotificationRequest {
  receiver?: string
  isRead?: boolean
  type?: string
  page?: number
  size?: number
}

export interface INotificationMetadata {
  order: string
  orderType: string
  tableName: string
  table: string // slug of the table
  branchName: string
  branch: string // slug of the branch
}

export interface INotification extends IBase {
  message: string
  senderId: string
  receiverId: string
  type: string
  isRead: boolean
  metadata: INotificationMetadata
}
