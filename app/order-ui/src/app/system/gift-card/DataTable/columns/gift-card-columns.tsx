import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { CoinsIcon } from 'lucide-react'

import { UpdateGiftCardSheet } from '@/components/app/sheet'
import { DeleteGiftCardDialog } from '@/components/app/dialog'
import { IGiftCard } from '@/types'
import { formatCurrency } from '@/utils'
import { publicFileURL, GiftCardStatus } from '@/constants'
import { Tooltip } from 'react-tooltip'

export const useGiftCardListColumns = (): ColumnDef<IGiftCard>[] => {
  const { t } = useTranslation(['giftCard', 'common'])
  const { t: tCommon } = useTranslation(['common'])

  return [
    {
      accessorKey: 'slug',
      header: () => <div className="">{t('giftCard.slug')}</div>,
      cell: ({ row }) => {
        const giftCard = row.original
        return <div className="text-sm">{giftCard?.slug}</div>
      },
    },
    {
      accessorKey: 'image',
      header: () => <div className="w-28">{t('giftCard.image')}</div>,
      cell: ({ row }) => {
        const giftCard = row.original
        const url = giftCard?.image ? `${publicFileURL}/${giftCard.image}` : ''
        return (
          <div className="flex items-center gap-2">
            <img
              src={url}
              alt={giftCard?.title}
              className="h-20 w-20 rounded-md object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/41x40?text=No+Image'
              }}
            />
          </div>
        )
      },
    },
    {
      accessorKey: 'title',
      header: () => <div className="w-52">{t('giftCard.title')}</div>,
      cell: ({ row }) => {
        const giftCard = row.original
        return (
          <>
            <div
              className="max-w-[200px] gap-2 truncate"
              data-tooltip-id="title-tooltip"
              data-tooltip-content={giftCard.title}
            >
              <span className="text-sm">{giftCard.title}</span>
            </div>
            <Tooltip
              id="title-tooltip"
              variant="light"
              style={{ width: '30rem' }}
            />
          </>
        )
      },
    },
    {
      accessorKey: 'description',
      header: () => <div className="w-96">{t('giftCard.description')}</div>,
      cell: ({ row }) => {
        const description = row.getValue('description')
        return (
          <>
            <div
              className="max-w-[200px] truncate text-sm"
              data-tooltip-id="description-tooltip"
              data-tooltip-content={String(description)}
            >
              {String(description)}
            </div>
            <Tooltip
              id="description-tooltip"
              variant="light"
              style={{ width: '30rem' }}
            />
          </>
        )
      },
    },
    {
      accessorKey: 'points',
      header: () => <div className="w-28">{t('giftCard.points')}</div>,
      cell: ({ row }) => {
        const points = row.getValue('points') as number
        return (
          <div className="flex items-center gap-2 text-sm">
            {formatCurrency(points, '')}
            <CoinsIcon className="h-5 w-5 text-yellow-500" />
          </div>
        )
      },
    },
    {
      accessorKey: 'price',
      header: () => <div className="w-28">{t('giftCard.price')}</div>,
      cell: ({ row }) => {
        const amount = row.getValue('price') as number
        return (
          <div className="flex items-center gap-2 text-sm">
            {formatCurrency(amount)}
          </div>
        )
      },
    },
    {
      accessorKey: 'isActive',
      header: () => <div className="w-32">{t('giftCard.status')}</div>,
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean
        const status = isActive
          ? GiftCardStatus.ACTIVE
          : GiftCardStatus.INACTIVE
        return (
          <div
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isActive ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
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
          <div className="flex w-20 items-center gap-2">
            <UpdateGiftCardSheet giftCard={giftCard} />
            <DeleteGiftCardDialog giftCard={giftCard} />
          </div>
        )
      },
    },
  ]
}
