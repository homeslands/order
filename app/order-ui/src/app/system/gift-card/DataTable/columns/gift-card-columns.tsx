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
      id: 'actions',
      header: tCommon('common.action'),
      cell: ({ row }) => {
        const giftCard = row.original
        return (
          <div className="flex gap-2 items-center w-20">
            <UpdateGiftCardSheet giftCard={giftCard} />
            <DeleteGiftCardDialog giftCard={giftCard} />
          </div>
        )
      },
    },
    {
      accessorKey: 'slug',
      header: () => <div className="">{t('giftCard.slug')}</div>,
      cell: ({ row }) => {
        const giftCard = row.original
        return <div className="text-sm w-28">{giftCard?.slug}</div>
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
            <div className="w-52 line-clamp-3"
              data-tooltip-id='title-tooltip'
              data-tooltip-content={String(giftCard.title)}
            >
              {giftCard.title}
            </div>
            <Tooltip id="title-tooltip" variant='light' style={{ width: '15rem' }} />
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
              className="w-96 text-sm line-clamp-4"
              data-tooltip-id='description-tooltip'
              data-tooltip-content={String(description)}>
              {String(description)}
            </div>
            <Tooltip id="description-tooltip" style={{ width: '25rem' }} variant='light' />
          </>
        )
      },
    },
    {
      accessorKey: 'points',
      header: () => <div className="w-28">{t('giftCard.points')}</div>,
      cell: ({ row }) => {
        const points = row.getValue('points') as number
        return <div className="text-sm flex items-center gap-2">
          {formatCurrency(points, '')}
          <CoinsIcon className="w-5 h-5 text-yellow-500" />
        </div>
      },
    },
    {
      accessorKey: 'price',
      header: () => <div className="w-28">{t('giftCard.price')}</div>,
      cell: ({ row }) => {
        const amount = row.getValue('price') as number
        return <div className="text-sm flex items-center gap-2">
          {formatCurrency(amount)}
        </div>
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
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${isActive
              ? 'bg-green-500 text-white '
              : 'bg-yellow-500 text-white'
              }`}
          >
            {t(`giftCard.${status.toLowerCase()}`)}
          </div>
        )
      },
    },
  ]
}
