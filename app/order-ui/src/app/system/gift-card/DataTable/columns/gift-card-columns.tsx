import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { MoreHorizontal } from 'lucide-react'

import {
  Button,
  DataTableColumnHeader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui'
import { UpdateGiftCardSheet } from '@/components/app/sheet'
import { DeleteGiftCardDialog } from '@/components/app/dialog'
import { IGiftCard } from '@/types'
import { formatCurrency } from '@/utils'
import { publicFileURL, GiftCardStatus } from '@/constants'

export const useGiftCardListColumns = (): ColumnDef<IGiftCard>[] => {
  const { t } = useTranslation(['giftCard', 'common'])
  const { t: tCommon } = useTranslation(['common'])

  return [
    {
      accessorKey: 'slug',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('giftCard.slug')} />
      ),
      cell: ({ row }) => {
        const giftCard = row.original
        return <div className="text-sm">{giftCard?.slug}</div>
      },
    },
    {
      accessorKey: 'image',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('giftCard.image')} />
      ),
      cell: ({ row }) => {
        const giftCard = row.original
        return (
          <div className="flex items-center gap-2">
            <img
              src={giftCard?.image ? `${publicFileURL}/${giftCard.image}` : ''}
              alt={giftCard?.title}
              className="h-20 w-20 rounded-md object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/40x40?text=No+Image'
              }}
            />
          </div>
        )
      },
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('giftCard.title')} />
      ),
      cell: ({ row }) => {
        const giftCard = row.original
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm">{giftCard.title}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('giftCard.description')}
        />
      ),
      cell: ({ row }) => {
        const description = row.getValue('description')
        return (
          <div className="max-w-[200px] truncate text-sm">
            {String(description)}
          </div>
        )
      },
    },
    {
      accessorKey: 'points',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('giftCard.points')} />
      ),
      cell: ({ row }) => {
        const points = row.getValue('points') as number
        return (
          <div className="text-sm">
            {new Intl.NumberFormat().format(Number(points))}
          </div>
        )
      },
    },
    {
      accessorKey: 'price',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('giftCard.price')} />
      ),
      cell: ({ row }) => {
        const amount = row.getValue('price') as number
        return <div className="text-sm">{formatCurrency(amount)}</div>
      },
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('giftCard.status')} />
      ),
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean
        const status = isActive
          ? GiftCardStatus.ACTIVE
          : GiftCardStatus.INACTIVE
        return (
          <div
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isActive
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            {t(`giftCard.${status.toLowerCase()}`)}
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: tCommon('common.action'),
      cell: ({ row }) => {
        const giftCard = row.original
        return (
          <div className="w-[4rem]">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">{tCommon('common.action')}</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="flex flex-col gap-2">
                <DropdownMenuLabel>
                  {tCommon('common.action')}
                </DropdownMenuLabel>
                <UpdateGiftCardSheet giftCard={giftCard} />
                <DeleteGiftCardDialog giftCard={giftCard} />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}
