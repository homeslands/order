import { Trash2, Coins } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button, QuantityControl } from '@/components/ui'
import { GiftCardType, publicFileURL } from '@/constants'
import { formatCurrency } from '@/utils'
import { IGiftCardCartItem } from '@/types'
import { useIsMobile } from '@/hooks'

interface SingleGiftCardDisplayProps {
  item: IGiftCardCartItem
  onIncrement: () => void
  onDecrement: () => void
  onClear: () => void
  giftCardType?: string
}

export default function SingleGiftCardDisplay({
  item,
  onIncrement,
  onDecrement,
  onClear,
  giftCardType,
}: SingleGiftCardDisplayProps) {
  const { t } = useTranslation(['giftCard'])
  const isMobile = useIsMobile()
  return (
    <>
      <div className="grid grid-cols-8 rounded-md bg-muted/40 px-4 py-3 text-sm font-thin">
        <span className="col-span-3">{t('giftCard.giftCard')}</span>
        <span className="col-span-2 text-center">{t('giftCard.quantity')}</span>
        <span className="col-span-2 text-center">{t('giftCard.total')}</span>
        <span className="col-span-1 flex justify-center"></span>
      </div>

      <div
        className={`mb-2 flex flex-col rounded-md border bg-card text-card-foreground ${!item.isActive ? 'relative' : ''}`}
      >
        {!item.isActive && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
            <div className="rounded-md bg-destructive/90 px-3 py-1 text-sm font-medium text-white">
              {t('giftCard.notAvailable')}
            </div>
          </div>
        )}
        <div className="grid grid-cols-8 items-center gap-4 border-b p-2 last:border-b-0">
          <div
            className={`col-span-3 flex items-center gap-3 ${!item.isActive ? 'opacity-60' : ''}`}
          >
            {!isMobile && (
              <img
                src={`${publicFileURL}/${item.image}`}
                alt={item.title}
                className="h-16 w-16 rounded-md object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://placehold.co/64x64?text=No+Image'
                }}
              />
            )}
            <div className="flex min-w-0 flex-1 flex-col">
              <div
                className={`${isMobile ? '' : 'line-clamp-2'} cursor-pointer overflow-hidden hyphens-auto break-words text-sm font-medium`}
                title={item.title}
              >
                {item.title}
              </div>
              <div className="mt-1 gap-2 text-sm">
                <span>{formatCurrency(item.price)}</span>
                <div className="flex items-center gap-1">
                  {formatCurrency(item.points, '')}
                  <Coins className="h-5 w-5 text-yellow-500" />
                </div>
              </div>
            </div>
          </div>
          <div
            className={`col-span-2 flex items-center justify-center ${!item.isActive ? 'opacity-60' : ''}`}
          >
            <QuantityControl
              quantity={item.quantity}
              onIncrease={onIncrement}
              onDecrease={onDecrement}
              min={1}
              size="sm"
              disabled={!item.isActive || giftCardType === GiftCardType.GIFT}
            />
          </div>
          <div
            className={`col-span-2 text-center ${!item.isActive ? 'opacity-60' : ''}`}
          >
            <span
              className={`${isMobile ? 'whitespace-nowrap text-[12px]' : 'text-lg'} font-bold text-primary`}
            >
              {formatCurrency(item.price * item.quantity)}
            </span>
          </div>
          <div className="z-20 col-span-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClear}
              className={`text-destructive hover:text-destructive/80 dark:text-red-400 dark:hover:text-red-300 ${!item.isActive ? 'relative z-20' : ''}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
