import { TableStatus } from '@/constants'
import { IBase } from './base.type'

export interface Table extends IBase {
  id: string
  name: string
  width: number
  height: number
  status: TableStatus
}

export interface ITable extends IBase {
  name: string
  location: string
  status: TableStatus
}

export interface ITableLocation {
  id: string
  name: string
  qr_code: string
  createdAt: string
}

export interface TableContextMenu {
  x: number
  y: number
  tableId: string
}

export interface TableLayoutProps {
  onTableStatusChange?: (tableId: string, status: Table['status']) => void
  onTablePositionChange?: (tableId: string, x: number, y: number) => void
}

export interface ICreateTableRequest {
  name: string
  branch: string // Branch slug
  location?: string
  status: TableStatus
}

export interface ICreateMultipleTablesRequest {
  branch: string // Branch slug
  from: number
  to: number
  step: number
}

export interface IUpdateTableRequest {
  slug: string
  name: string
  location?: string
}

export interface IUpdateTableStatusRequest {
  slug: string
  status: TableStatus
}
