import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { History, Loader2 } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from '@/components/ui'

import { ILoyaltyPointHistory } from '@/types'
import { useOrderBySlug } from '@/hooks'
import { formatCurrency } from '@/utils'
import { LoyaltyPointTypeBadge, OrderStatusBadge } from '../badge'
import { LoyaltyPointHistoryType } from '@/constants'
import { ROUTE } from '@/constants'

interface ILoyaltyPointDetailHistoryDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onCloseSheet: () => void
  history: ILoyaltyPointHistory | null
  disabled?: boolean
}

export default function LoyaltyPointDetailHistoryDialog({
  isOpen,
  onOpenChange,
  onCloseSheet: _onCloseSheet,
  history,
  disabled: _disabled,
}: ILoyaltyPointDetailHistoryDialogProps) {
  const { t } = useTranslation(['loyaltyPoint'])
  const { t: tOrder } = useTranslation('menu')
  const { t: tCommon } = useTranslation('common')
  const hasOrderSlug = !!history?.orderSlug
  const { data, isPending } = useOrderBySlug(hasOrderSlug ? history?.orderSlug : undefined)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[22rem] rounded-md px-6 sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b border-primary text-primary">
            <div className="flex gap-2 items-center">
              <History className="w-6 h-6" />
              {t('loyaltyPoint.detailHistory')}
            </div>
          </DialogTitle>
          <DialogDescription className="p-2 rounded-md bg-primary/10 text-primary">
            {t('loyaltyPoint.detailHistory')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          {/* History details */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('loyaltyPoint.type.type')}</span>
              <span className="font-medium">{history?.type ? (
                <LoyaltyPointTypeBadge type={history.type as LoyaltyPointHistoryType} />
              ) : (
                <span>-</span>
              )}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('loyaltyPoint.points')}</span>
              <span className="font-medium">{history ? history.points.toLocaleString() : '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('loyaltyPoint.lastPoints')}</span>
              <span className="font-medium">{history ? history.lastPoints.toLocaleString() : '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('loyaltyPoint.date')}</span>
              <span className="font-medium">{history ? new Date(history.date).toLocaleString() : '-'}</span>
            </div>
          </div>

          {/* Order section */}
          <div className="pt-2 border-t">
            <div className="mb-2 font-semibold">{t('loyaltyPoint.relatedOrder')}</div>
            {!hasOrderSlug && (
              <div className="text-muted-foreground">{t('loyaltyPoint.noRelatedOrder')}</div>
            )}
            {hasOrderSlug && isPending && (
              <div className="flex gap-2 items-center text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('loyaltyPoint.loadingOrder')}
              </div>
            )}
            {hasOrderSlug && !isPending && (
              <>
                {data?.result ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{t('loyaltyPoint.orderCode')}</span>
                      <div className="flex gap-2 items-center">
                        <span className="font-medium">#{data.result.slug}</span>
                        <NavLink to={`${ROUTE.STAFF_ORDER_MANAGEMENT}?order=${data.result.slug}`}>
                          <span className="text-primary">{tOrder('order.viewDetail')}</span>
                        </NavLink>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('loyaltyPoint.orderStatus')}</span>
                      <span className="font-medium"><OrderStatusBadge order={data.result} /></span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('loyaltyPoint.orderDate')}</span>
                      <span className="font-medium">{new Date(data.result.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('loyaltyPoint.orderTotal')}</span>
                      <span className="font-bold text-primary">{formatCurrency(data.result.subtotal || 0)}</span>
                    </div>

                  </div>
                ) : (
                  <div className="text-muted-foreground">{t('loyaltyPoint.orderNotFound')}</div>
                )}
              </>
            )}
          </div>
        </div>
        <DialogFooter className="flex flex-row gap-2 justify-center">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border border-gray-300 min-w-24"
          >
            {tCommon('common.cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
