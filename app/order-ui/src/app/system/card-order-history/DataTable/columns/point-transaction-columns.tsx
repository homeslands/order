import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import { IPointTransaction } from '@/types'
import { formatCurrency } from '@/utils'
import moment from 'moment'
import { PointTransactionType } from '@/constants'

export const usePointTransactionColumns = (props: { page: number, size: number }): ColumnDef<IPointTransaction>[] => {
  const { t } = useTranslation(['giftCard', 'common'])
  const { t: tProfile } = useTranslation('profile')
  const { page, size } = props;

  return [
    {
      accessorKey: 'index',
      header: () => <div className="font-semibold text-black text-center dark:text-white">STT</div>,
      cell: ({ row }) => {
        const currIndex = (page - 1) * size + (row?.index ?? 0) + 1;
        return (
          <div
            className="text-sm text-gray-700 dark:text-gray-300 text-center w-28"
          >
            {currIndex}
          </div>
        )
      },
    },
    {
      accessorKey: 'customerName',
      header: () => <div className=" dark:text-white font-semibold text-black text-center">{t('giftCard.pointTransaction.customerName')}</div>,
      cell: ({ row }) => {
        const rowData = row.original
        return (
          <div className="text-left text-sm text-gray-900 dark:text-white w-44">
            {`${rowData?.user?.firstName} ${rowData?.user?.lastName}`}
          </div>
        )
      },
    },
    {
      accessorKey: 'phonenumber',
      header: () => <div className="dark:text-white font-semibold text-black text-center">{t('giftCard.pointTransaction.phonenumber')}</div>,
      cell: ({ row }) => {
        const rowData = row.original
        return (
          <div
            className="text-center text-gray-700 dark:text-gray-300 w-28"
          >
            {rowData?.user?.phonenumber}
          </div>
        )
      },
    },

    {
      accessorKey: 'type',
      header: () => <div className="dark:text-white font-semibold text-black text-center">{t('giftCard.pointTransaction.type')}</div>,
      cell: ({ row }) => {
        const rowData = row.original
        const className = rowData?.type === PointTransactionType.IN ? 'text-green-600' : 'text-red-600';
        return (
          <div className={`w-44 text-sm text-gray-700 text-center ${className}`}>
            {rowData?.type === PointTransactionType.IN ? tProfile('profile.coinEarned') : tProfile("profile.coinSpent")}
          </div>
        )
      },
    },
    {
      accessorKey: 'points',
      header: () => <div className="font-semibold text-black text-center dark:text-white">{t('giftCard.pointTransaction.points')}</div>,
      cell: ({ row }) => {
        const rowData = row.original;
        const total = rowData?.points as number;
        const className = rowData?.type === PointTransactionType.IN ? 'text-green-600' : 'text-red-600';
        return (
          <div className={`text-sm text-gray-700 text-right w-32 font-bold ${className}`} >
            {rowData?.type === PointTransactionType.IN ? '+' : '-'}
            {formatCurrency(total, '')}
          </div>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: () => <div className="font-semibold text-black text-center dark:text-white">{t('giftCard.pointTransaction.createdAt')}</div>,
      cell: ({ row }) => {
        const rowData = row.original
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300 w-44">
            {moment(rowData.createdAt).format('HH:mm:ss DD/MM/YYYY')}
          </div>
        )
      },
    },
  ]
}
