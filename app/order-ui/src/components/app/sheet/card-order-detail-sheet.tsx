import moment from 'moment'
import { useTranslation } from 'react-i18next'

import { ICardOrderResponse, OrderStatus } from '@/types'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui'
import { formatCurrency } from '@/utils'
import CardOrderStatusBadge from '../badge/card-order-status-badge'

interface IOrderHistoryDetailSheetProps {
  data: ICardOrderResponse
  isOpen: boolean
  onClose: () => void
}

export default function CardOrderDetailSheet({
  data,
  isOpen,
  onClose,
}: IOrderHistoryDetailSheetProps) {
  const { t: tCommon } = useTranslation(['common'])
  const { t } = useTranslation(['menu'])
  const { t: tToast } = useTranslation('toast')
  // const { mutate: exportOrderInvoice, isPending } = useExportOrderInvoice()

  // const handleExportOrderInvoice = async (order: IOrder | undefined) => {
  //   if (!order) return // Ensure order is defined before proceeding
  //   exportOrderInvoice(order?.slug || '', {
  //     onSuccess: (data: Blob) => {
  //       showToast(tToast('toast.exportInvoiceSuccess'))
  //       // Load data to print
  //       loadDataToPrinter(data)
  //     },
  //   })
  // }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[100%] p-2">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 mt-8">
            {t('giftCard.cardOrder.detail')}
            <span className="text-muted-foreground">
              #{data?.slug}
            </span>
          </SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto h-[80vh] pb-4 mb-4">
          {data ? (
            <div className="flex flex-col gap-4">
              {/* Info */}
              <div className="flex flex-col w-full gap-4">
                {/* Order info */}
                <div className="flex items-center justify-between p-3 border rounded-sm">
                  <div className="flex flex-col gap-2">
                    <p className="flex items-center gap-2 pb-2">
                      <CardOrderStatusBadge status={data?.status} />
                    </p>
                    <div className="flex items-center gap-1 text-sm font-thin">
                      <p>
                        {moment(data?.createdAt).format(
                          'hh:mm:ss DD/MM/YYYY',
                        )}
                      </p>{' '}
                      |
                      <p className="flex items-center gap-1">
                        <span>
                          {t('order.cashier')}{' '}
                        </span>
                        <span className="text-muted-foreground">
                          {`${data?.cashierName} - ${data?.cashierPhone}`}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                {/* Order owner info */}
                <div className="flex gap-2">
                  <div className="w-1/2 border rounded-sm">
                    <div className="px-3 py-2 font-bold uppercase">
                      {t('order.customer')}
                    </div>
                    <div className="px-3 py-2">
                      <p className="text-sm font-bold">
                        {`${data?.customerName} - ${data?.cashierPhone}`}
                      </p>
                    </div>
                  </div>
                </div>
                {/* payment */}
                <div className="flex flex-col w-full gap-2">
                  {/* Payment method, status */}
                  <div className={`rounded-sm border ${data.payment?.statusMessage === OrderStatus.COMPLETED ? 'border-green-500 bg-green-100' : 'border-destructive bg-destructive/10'}`}>
                    <div className="px-3 py-2">
                      <p className="flex flex-col items-start gap-1 pb-2">
                        <span className="col-span-1 text-sm font-bold">
                          {t('paymentMethod.title')}
                        </span>
                      </p>
                    </div>
                  </div>
                  {/* Total */}

                </div>
                {/* Order table */}
                <div className="flex flex-col gap-2 p-2 border rounded-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {t('order.subtotal')}
                    </p>
                    <p className='text-muted-foreground'>{`${formatCurrency(data?.totalAmount || 0)}`}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-md">
                      {t('order.totalPayment')}
                    </p>
                    <p className="text-xl font-bold text-primary">{`${formatCurrency(data?.totalAmount || 0)}`}</p>
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
        {/* <SheetFooter>
          <div className="w-full">
            <Button className='w-full' onClick={() => handleExportOrderInvoice(orderDetail)} disabled={isPending}>
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <DownloadIcon />}
              {t('order.exportInvoice')}
            </Button>
          </div>
        </SheetFooter> */}
      </SheetContent>
    </Sheet>
  )
}
