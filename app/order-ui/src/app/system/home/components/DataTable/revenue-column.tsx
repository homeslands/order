import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

import {
    DataTableColumnHeader,
} from '@/components/ui'
import { IBranchRevenue } from '@/types'
import { formatCurrency } from '@/utils'

export const useRevenueListColumns = (): ColumnDef<IBranchRevenue>[] => {
    const { t } = useTranslation(['revenue', 'common'])

    return [
        {
            accessorKey: 'date',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('revenue.date')} />
            ),
            cell: ({ row }) => {
                const date = row.original.date
                return (
                    <div className="text-sm">
                        {date ? moment(date).format('DD/MM/YYYY') : ''}
                    </div>
                )
            },
        },
        {
            accessorKey: 'totalOrder',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('revenue.totalOrder')} />
            ),
            cell: ({ row }) => {
                const totalOrder = row.original.totalOrder
                return totalOrder > 0 ? <div className="text-sm">{totalOrder}</div> : null
            },
        },
        {
            accessorKey: 'originalAmount',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('revenue.originalAmount')} />
            ),
            cell: ({ row }) => {
                const originalAmount = row.original.originalAmount
                return <div className="text-sm">{formatCurrency(originalAmount)}</div>
            },
        },
        {
            accessorKey: 'promotionAmount',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('revenue.promotionAmount')} />
            ),
            cell: ({ row }) => {
                const promotionAmount = row.original.promotionAmount
                return <div className="text-sm text-red-500">- {formatCurrency(promotionAmount)}</div>
            },
        },
        {
            accessorKey: 'voucherAmount',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('revenue.voucherAmount')} />
            ),
            cell: ({ row }) => {
                const voucherAmount = row.original.voucherAmount
                return <div className="text-sm text-red-500">- {formatCurrency(voucherAmount)}</div>
            },
        },
        {
            accessorKey: 'totalAmount',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('revenue.totalAmount')} />
            ),
            cell: ({ row }) => {
                const totalAmount = row.original.totalAmount
                return <div className="text-sm font-bold text-green-500">{formatCurrency(totalAmount)}</div>
            },
        },
    ]
}
