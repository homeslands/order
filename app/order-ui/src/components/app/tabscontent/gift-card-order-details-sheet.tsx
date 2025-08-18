import { useTranslation } from 'react-i18next'
import moment from 'moment'
import {
  Calendar,
  CreditCard,
  Gift,
  MessageSquare,
  Phone,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Copy,
  User,
} from 'lucide-react'

import { useIsMobile } from '@/hooks'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Badge,
  Button,
  Separator,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui'

import { ICardOrderResponse } from '@/types'
import { CardOrderStatus, ROUTE } from '@/constants'
import {
  formatCurrency,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getGiftCardTypeLabel,
  getGiftCardOrderStatusLabel,
} from '@/utils'
import { NavLink } from 'react-router-dom'

interface GiftCardOrderDetailsSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  cardOrder: ICardOrderResponse | null
}

export function GiftCardOrderDetailsSheet({
  isOpen,
  onOpenChange,
  cardOrder,
}: GiftCardOrderDetailsSheetProps) {
  const { t } = useTranslation(['profile'])
  const isMobile = useIsMobile()

  if (!cardOrder) return null

  const copyToClipboard = async (text: string, _label: string) => {
    await navigator.clipboard.writeText(text)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case CardOrderStatus.COMPLETED:
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case CardOrderStatus.PENDING:
        return <Clock className="h-5 w-5 text-yellow-500" />
      case CardOrderStatus.FAILED:
        return <XCircle className="h-5 w-5 text-red-500" />
      case CardOrderStatus.CANCELLED:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
      default:
        return <Package className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadgeVariant = (
    status: string,
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case CardOrderStatus.COMPLETED:
        return 'default'
      case CardOrderStatus.PENDING:
        return 'secondary'
      case CardOrderStatus.FAILED:
        return 'destructive'
      case CardOrderStatus.CANCELLED:
        return 'outline'
      default:
        return 'outline'
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        className={`w-full overflow-y-auto p-0 ${isMobile ? 'sm:max-w-full' : 'sm:max-w-2xl'}`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <SheetHeader
            className={`border-b bg-gradient-to-r from-purple-50 to-pink-50 ${isMobile ? 'p-4' : 'p-6'} dark:from-purple-950/20 dark:to-pink-950/20`}
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(cardOrder.status)}
              <div>
                <SheetTitle
                  className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold`}
                >
                  {t('profile.cardOrder.orderDetails')}
                </SheetTitle>
                <SheetDescription
                  className={`${isMobile ? 'text-sm' : 'text-base'}`}
                >
                  {cardOrder.cardTitle}
                </SheetDescription>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Badge
                variant={getStatusBadgeVariant(cardOrder.status)}
                className="px-3 py-1"
              >
                {getGiftCardOrderStatusLabel(cardOrder.status)}
              </Badge>
              <div className="text-sm text-muted-foreground">
                <Calendar className="mr-1 inline h-4 w-4" />
                {moment(cardOrder.orderDate || cardOrder.createdAt).format(
                  isMobile ? 'HH:mm DD/MM/YY' : 'HH:mm:ss DD/MM/YYYY',
                )}
              </div>
            </div>
          </SheetHeader>

          {/* Content */}
          <div className={`flex-1 space-y-6 ${isMobile ? 'p-4' : 'p-6'}`}>
            {/* Payment Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle
                  className={`flex items-center gap-2 ${isMobile ? 'text-base' : 'text-lg'}`}
                >
                  <CreditCard className="h-5 w-5 text-blue-500" />
                  {t('profile.cardOrder.paymentInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className={`grid grid-cols-1 gap-4 ${isMobile ? '' : 'sm:grid-cols-2'}`}
                >
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {t('profile.cardOrder.paymentMethod')}
                    </span>
                    <p className="font-medium">
                      {getPaymentMethodLabel(cardOrder.paymentMethod)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {t('profile.cardOrder.paymentStatus')}
                    </span>
                    <p className="font-medium">
                      {getPaymentStatusLabel(cardOrder.paymentStatus)}
                    </p>
                  </div>
                </div>

                {cardOrder.payment && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <div
                        className={`flex ${isMobile ? 'flex-col gap-1' : 'items-center justify-between'}`}
                      >
                        <span className="text-sm font-medium text-muted-foreground">
                          {t('profile.cardOrder.transactionId')}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono ${isMobile ? 'text-xs' : 'text-sm'} break-all`}
                          >
                            {cardOrder.payment.transactionId}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 flex-shrink-0 p-0"
                            onClick={() =>
                              copyToClipboard(
                                cardOrder.payment!.transactionId,
                                'Transaction ID',
                              )
                            }
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div
                        className={`flex ${isMobile ? 'flex-col gap-1' : 'items-center justify-between'}`}
                      >
                        <span className="text-sm font-medium text-muted-foreground">
                          {t('profile.cardOrder.paymentDate')}
                        </span>
                        <span className="font-medium">
                          {moment(cardOrder.payment.createdAt).format(
                            isMobile ? 'HH:mm DD/MM/YY' : 'HH:mm:ss DD/MM/YYYY',
                          )}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <Separator />
                <div
                  className={`flex ${isMobile ? 'flex-col gap-1' : 'items-center justify-between'}`}
                >
                  <span className="text-sm font-medium text-muted-foreground">
                    {t('profile.cardOrder.total')}
                  </span>
                  <span
                    className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-primary`}
                  >
                    {formatCurrency(cardOrder.totalAmount)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Gift Card Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle
                  className={`flex items-center gap-2 ${isMobile ? 'text-base' : 'text-lg'}`}
                >
                  <Gift className="h-5 w-5 text-primary" />
                  {t('profile.cardOrder.giftCardInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className={`grid grid-cols-1 gap-4 ${isMobile ? '' : 'sm:grid-cols-2'}`}
                >
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {t('profile.cardOrder.cardType')}
                    </span>
                    <p className="font-medium">
                      {getGiftCardTypeLabel(cardOrder.type)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {t('profile.cardOrder.cardPrice')}
                    </span>
                    <p className="font-medium">
                      {formatCurrency(cardOrder.cardPrice)}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <NavLink to={`${ROUTE.CLIENT_PROFILE}?tab=gift-card`}>
                    <Button> {t('profile.common.viewDetails')}</Button>
                  </NavLink>
                </div>
              </CardContent>
            </Card>

            {/* Recipients Information */}
            {cardOrder.receipients && cardOrder.receipients.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle
                    className={`flex items-center gap-2 ${isMobile ? 'text-base' : 'text-lg'}`}
                  >
                    <User className="h-5 w-5 text-green-500" />
                    {t('profile.cardOrder.recipients')}
                    <Badge variant="secondary">
                      {cardOrder.receipients.length}{' '}
                      {t('profile.cardOrder.recipient')}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    {cardOrder.receipients.map((recipient, index) => (
                      <Card
                        key={recipient.slug || index}
                        className="border border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20"
                      >
                        <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
                          <div className="space-y-3">
                            <div
                              className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'}`}
                            >
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-green-500" />
                                <span className="font-semibold">
                                  {recipient.name !== 'null null'
                                    ? recipient.name
                                    : t('profile.cardOrder.noName')}
                                </span>
                              </div>
                              <Badge variant="outline">
                                {recipient.quantity}{' '}
                                {t('profile.cardOrder.giftCard')}
                              </Badge>
                            </div>

                            {recipient.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {recipient.phone}
                                </span>
                              </div>
                            )}

                            {recipient.message && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">
                                    {t('profile.cardOrder.message')}:
                                  </span>
                                </div>
                                <p
                                  className={`rounded-lg bg-white ${isMobile ? 'p-2' : 'p-3'} text-sm text-muted-foreground dark:bg-gray-800`}
                                >
                                  "{recipient.message}"
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
