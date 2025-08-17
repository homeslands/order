import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import { ICardOrderResponse } from '@/types'
import { formatCurrency } from '@/utils'
import moment from 'moment'
import { PaymentMethod } from '@/constants'
import CardOrderStatusBadge from '@/components/app/badge/card-order-status-badge'
import CardOrderActionCell from './card-order-action-cell'

export const useCardOrderColumns = (): ColumnDef<ICardOrderResponse>[] => {
  const { t } = useTranslation(['giftCard', 'common'])
  const { t: tCommon } = useTranslation(['common'])

  return [
    {
      id: 'actions',
      header: () => <div className="text-center text-nowrap">{tCommon('common.action')}</div>,
      cell: ({ row }) => {
        return <CardOrderActionCell rowData={row.original} />
      },
    },
    {
      accessorKey: 'slug',
      header: () => <div className="text-center">{t('giftCard.cardOrder.slug')}</div>,
      cell: ({ row }) => {
        const rowData = row.original
        return (
          <div
            className="text-sm text-gray-700 dark:text-gray-300 text-center"
          >
            {rowData?.slug}
          </div>
        )
      },
    },
    {
      accessorKey: 'paymentMethod',
      header: () => <div className="text-center">{t('giftCard.cardOrder.paymentMethod')}</div>,
      cell: ({ row }) => {
        const rowData = row.original
        return (
          <div className="text-center text-sm text-gray-900 dark:text-white text-nowrap">
            {rowData?.paymentMethod === PaymentMethod.CASH
              ? t('giftCard.cardOrder.cash')
              : t('giftCard.cardOrder.bankTransfer')}
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: () => <div className="text-center">{t('giftCard.cardOrder.status')}</div>,
      cell: ({ row }) => {
        const rowData = row.original
        return (
          <div
            className="text-center text-gray-700 dark:text-gray-300 text-nowrap"
          >
            <CardOrderStatusBadge status={rowData?.status} />
          </div>
        )
      },
    },
    {
      accessorKey: 'totalAmount',
      header: () => <div className="text-center">{t('giftCard.cardOrder.totalAmount')}</div>,
      cell: ({ row }) => {
        const rowData = row.original;
        const total = rowData?.totalAmount as number;
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300 text-right text-nowrap">
            {formatCurrency(total)}
          </div>
        )
      },
    },
    {
      accessorKey: 'cashierName',
      header: () => <div className="text-center">{t('giftCard.cardOrder.cashierName')}</div>,
      cell: ({ row }) => {
        const rowData = row.original
        return (
          <div className="w-40 text-sm text-gray-700 dark:text-gray-300 text-nowrap">
            {rowData?.cashierName}
          </div>
        )
      },
    },
    {
      accessorKey: 'customerName',
      header: () => <div className="text-center">{t('giftCard.cardOrder.customerName')}</div>,
      cell: ({ row }) => {
        const rowData = row.original
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300 text-nowrap">
            {rowData?.customerName}
          </div>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: () => <div className="text-center">{t('giftCard.cardOrder.createdAt')}</div>,
      cell: ({ row }) => {
        const rowData = row.original
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300 text-nowrap">
            {moment(rowData.createdAt).format('HH:mm:ss DD/MM/YYYY')}
          </div>
        )
      },
    },
    // {
    //   accessorKey: 'isActive',
    //   header: () => <div className="w-32">{t('giftCard.status')}</div>,
    //   cell: ({ row }) => {
    //     const isActive = row.getValue('isActive') as boolean
    //     const status = isActive
    //       ? GiftCardStatus.ACTIVE
    //       : GiftCardStatus.INACTIVE
    //     return (
    //       <div
    //         className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${isActive ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
    //           }`}
    //       >
    //         {t(`giftCard.${status.toLowerCase()}`)}
    //       </div>
    //     )
    //   },
    // }
  ]
}
