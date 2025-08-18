import { useTranslation } from 'react-i18next'

import { ICardOrderResponse, IRecipient } from '@/types'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { formatCurrency } from '@/utils'
import { PaymentMethod, paymentStatus } from '@/constants'
import CardOrderStatusBadge from '../badge/card-order-status-badge'

interface IOrderHistoryDetailSheetProps {
  data: ICardOrderResponse | null
  isOpen: boolean
  onClose: () => void
}

export default function CardOrderDetailSheet({
  data,
  isOpen,
  onClose,
}: IOrderHistoryDetailSheetProps) {
  const { t: tCommon } = useTranslation(['common'])
  const { t } = useTranslation(['giftCard'])

  const renderRecipients = (recipients: IRecipient[], points: number) => {
    return recipients.map(item => {
      return (
        <TableRow className='border-b'>
          <TableCell className="font-semibold runcate text-center border-r">
            {item?.name}
          </TableCell>
          <TableCell className="text-center border-r">
            x{item?.quantity}
          </TableCell>
          <TableCell className="text-center border-r">
            {formatCurrency(points, '')}
          </TableCell>
          <TableCell className="text-center border-r text-primary">
            {item.message}
          </TableCell>
        </TableRow>
      )
    })
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full p-2">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 mb-3">
            {t('giftCard.cardOrder.detail')}
            <span className="text-muted-foreground">
              #{data?.slug}
            </span>
            <CardOrderStatusBadge status={data?.status || ""} />
          </SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto h-[80vh] pb-4 mb-4">
          {data ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col w-full gap-4">
                {/* Cashier info */}
                {
                  data?.cashierId && <div className="border rounded-sm border-primary">
                    <div className='p-2 border-b bg-gray-50'>
                      <label className='font-bold uppercase text-primary'>
                        {t('giftCard.cardOrder.cashierInfo')}
                      </label>
                    </div>
                    <div className="p-2 flex flex-col gap-2">
                      <div className='flex items-center gap-1'>
                        <label className='min-w-40 text-sm'>
                          {t('giftCard.cardOrder.cashier')}
                        </label>
                        <p className="text-gray-700 font-semibold text-sm">
                          {`${data?.cashierName || ''}`}
                        </p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <label className='min-w-40'>
                          {t('giftCard.cardOrder.cashierPhone')}
                        </label>
                        <p className="text-gray-700 font-semibold text-sm">
                          {`${data?.cashierName || ''}`}
                        </p>
                      </div>
                    </div>
                  </div>
                }

                {/* Customer info */}
                <div className="border rounded-sm çborder-primary">
                  <div className='p-2 border-b bg-gray-50'>
                    <label className='font-bold uppercase text-primary'>
                      {t('giftCard.cardOrder.customerInfo')}
                    </label>
                  </div>
                  <div className="p-2 flex flex-col gap-2">
                    <div className='flex items-center gap-1'>
                      <label className='min-w-40 text-sm'>
                        {t('giftCard.cardOrder.customer')}
                      </label>
                      <p className="text-gray-700 font-semibold text-sm">
                        {`${data?.customerName || ''}`}
                      </p>
                    </div>
                    <div className='flex items-center gap-1'>
                      <label className='min-w-40 text-sm'>
                        {t('giftCard.cardOrder.customerPhone')}
                      </label>
                      <p className="text-gray-700 font-semibold text-sm">
                        {`${data?.customerPhone || ''}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment info */}
                <div className="border rounded-sm çborder-primary">
                  <div className='p-2 border-b bg-gray-50'>
                    <label className='font-bold uppercase text-primary'>
                      {t('giftCard.cardOrder.paymentInfo')}
                    </label>
                  </div>
                  <div className="p-2 flex flex-col gap-2">
                    <div className='flex items-center gap-1'>
                      <label className='min-w-40 text-sm'>
                        {t('giftCard.cardOrder.paymentMethod')}
                      </label>
                      <p className="text-gray-700 font-semibold text-sm">
                        {data?.paymentMethod === PaymentMethod.CASH
                          ? t('giftCard.cardOrder.cash')
                          : t('giftCard.cardOrder.bankTransfer')}
                      </p>
                    </div>
                    <div className='flex items-center gap-1'>
                      <label className='min-w-40 text-sm'>
                        {t('giftCard.cardOrder.paymentStatus')}
                      </label>
                      <p className="text-gray-700 font-bold text-sm">
                        {t(`giftCard.cardOrder.${data?.paymentStatus}`)}
                      </p>
                    </div>
                    {data.paymentStatus === paymentStatus.PENDING && data?.payment?.qrCode &&
                      <div className='flex justify-center items-center flex-col gap-1'>
                        <img
                          src={data?.payment?.qrCode || ''}
                          className="mb-4 h-48 w-48 rounded border bg-white p-2 dark:bg-gray-100"
                        />
                        <p className='font-bold'>Số tiền thanh toán: {formatCurrency(data?.totalAmount || 0)}</p>
                      </div>
                    }
                  </div>
                </div>

                {/* Order info */}
                <div className="border rounded-sm çborder-primary">
                  <div className='p-2 border-b bg-gray-50'>
                    <label className='font-bold uppercase text-primary'>
                      {t('giftCard.cardOrder.orderInfo')}
                    </label>
                  </div>
                  <div className="p-2">
                    <Table className="min-w-full border border-collapse table-fixed">
                      <TableHeader className="bg-muted-foreground/10 dark:bg-transparent">
                        <TableRow>
                          <TableHead className="text-center w-[15rem] border">{t('giftCard.cardOrder.cardName')}</TableHead>
                          <TableHead className="w-[12rem] text-center border">{t('giftCard.cardOrder.type')}</TableHead>
                          <TableHead className="text-center border w-[5rem]">{t('giftCard.cardOrder.quantity')}</TableHead>
                          <TableHead className="text-center border w-[8rem]">{t('giftCard.cardOrder.points')}</TableHead>
                          <TableHead className="text-center border w-[8rem]">{t('giftCard.cardOrder.price')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className='border-b'>
                          <TableCell className="font-semibold runcate text-center border-r">
                            {data?.cardTitle}
                          </TableCell>
                          <TableCell className="text-center border-r">
                            {t(`giftCard.cardOrder.${data.type.toLowerCase()}`)}
                          </TableCell>
                          <TableCell className="text-center border-r">
                            x{data.quantity}
                          </TableCell>
                          <TableCell className="text-center border-r text-primary">
                            {formatCurrency(data?.cardPoint, '')}
                          </TableCell>
                          <TableCell className="text-center">
                            {formatCurrency(data?.cardPrice)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="text-center border-r font-bold" colSpan={4}>
                            {t('giftCard.cardOrder.totalAmount')}
                          </TableCell>
                          <TableCell className="text-center">
                            {formatCurrency(data?.totalAmount)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>

                    {/* Receipients info */}
                    {
                      data?.receipients?.length > 0 &&
                      <div className='mt-3'>
                        <p className='text-sm font-bold'>
                          {t('giftCard.cardOrder.receipientInfo')}
                        </p>
                        <Table className="min-w-full border border-collapse table-fixed mt-1">
                          <TableHeader className="bg-muted-foreground/10 dark:bg-transparent">
                            <TableRow>
                              <TableHead className="text-center w-[15rem] border">{t('giftCard.cardOrder.name')}</TableHead>
                              <TableHead className="w-[6rem] text-center border">{t('giftCard.cardOrder.quantity')}</TableHead>
                              <TableHead className="text-center border w-[8rem]">{t('giftCard.cardOrder.points')}</TableHead>
                              <TableHead className="text-center border w-[15rem]">{t('giftCard.cardOrder.message')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {renderRecipients(data?.receipients, data?.cardPoint)}
                          </TableBody>
                        </Table>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="flex min-h-[12rem] items-center justify-center text-muted-foreground">
              {tCommon('common.noData')}
            </p>
          )}
        </div>
      </SheetContent >
    </Sheet >
  )
}
