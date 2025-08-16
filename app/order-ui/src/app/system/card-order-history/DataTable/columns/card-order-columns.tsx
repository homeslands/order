import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import { ICardOrderResponse } from '@/types'
import { formatCurrency } from '@/utils'
import moment from 'moment'

export const useCardOrderColumns = (): ColumnDef<ICardOrderResponse>[] => {
  const { t } = useTranslation(['giftCard', 'common'])
  const { t: tCommon } = useTranslation(['common'])

  return [
    {
      id: 'actions',
      header: tCommon('common.action'),
      cell: ({ row }) => {
        const rowData = row.original
        return (
          <div className="flex w-20 items-center gap-2">
            {/* <UpdateGiftCardSheet giftCard={giftCard} />
            <DeleteGiftCardDialog giftCard={giftCard} /> */}
          </div>
        )
      },
    },
    {
      accessorKey: 'slug',
      header: () => <div className="w-10">{t('cardOrder.slug')}</div>,
      cell: ({ row }) => {
        const rowData = row.original
        return (
          <div
            className="text-sm text-gray-700 dark:text-gray-300"
          >
            {rowData?.slug}
          </div>
        )
      },
    },
    {
      accessorKey: 'paymentMethod',
      header: () => <div className="w-40">{t('cardOrder.paymentMethod')}</div>,
      cell: ({ row }) => {
        const rowData = row.original
        return (
          <div
            className="line-clamp-3 w-40"
          >
            <span className="text-sm text-gray-900 dark:text-white">
              {rowData?.paymentMethod}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: () => <div className="w-52">{t('cardOrder.status')}</div>,
      cell: ({ row }) => {
        const rowData = row.original
        return (
          <div
            className="line-clamp-4 w-52 text-sm text-gray-700 dark:text-gray-300"
          >
            {rowData?.status}
          </div>
        )
      },
    },
    {
      accessorKey: 'totalAmount',
      header: () => <div className="w-28">{t('cardOrder.totalAmount')}</div>,
      cell: ({ row }) => {
        const rowData = row.original;
        const total = rowData?.totalAmount as number;
        return (
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            {formatCurrency(total, '')}
          </div>
        )
      },
    },
    {
      accessorKey: 'cashierName',
      header: () => <div className="w-28">{t('cardOrder.cashierName')}</div>,
      cell: ({ row }) => {
        const rowData = row.original
        return (
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            {rowData?.cashierName}
          </div>
        )
      },
    },
    {
      accessorKey: 'customerName',
      header: () => <div className="w-28">{t('cardOrder.customerName')}</div>,
      cell: ({ row }) => {
        const rowData = row.original
        return (
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            {rowData?.customerName}
          </div>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: () => <div className="w-28">{t('cardOrder.createdAt')}</div>,
      cell: ({ row }) => {
        const rowData = row.original
        return (
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            {moment(rowData.createdAt).format('HH:mm DD/MM/YYYY')}
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
