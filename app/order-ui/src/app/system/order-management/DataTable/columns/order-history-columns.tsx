import { NavLink } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import {
  MoreHorizontal,
  CreditCard,
  DownloadIcon,
  SquarePen,
  Loader2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

import {
  Button,
  DataTableColumnHeader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui'
import { IOrder, OrderStatus, OrderTypeEnum } from '@/types'
import { PaymentMethod, paymentStatus, PrinterJobType, ROUTE } from '@/constants'
import { useExportOrderInvoice, useExportPayment, useGetAuthorityGroup, useReprintFailedInvoicePrinterJobs } from '@/hooks'
import { formatCurrency, hasPermissionInBoth, loadDataToPrinter, showToast } from '@/utils'
import OrderStatusBadge from '@/components/app/badge/order-status-badge'
import { CreateChefOrderDialog, OutlineCancelOrderDialog } from '@/components/app/dialog'
import { useUserStore } from '@/stores'

export const useOrderHistoryColumns = (): ColumnDef<IOrder>[] => {
  const { t } = useTranslation(['menu'])
  const { t: tToast } = useTranslation(['toast'])
  const { t: tCommon } = useTranslation(['common'])
  const { userInfo } = useUserStore()
  const { data: authorityData } = useGetAuthorityGroup({})

  const authorityGroup = authorityData?.result ?? [];
  const authorityGroupCodes = Array.isArray(authorityGroup)
    ? authorityGroup.flatMap(group =>
      Array.isArray(group.authorities)
        ? group.authorities
          .filter(auth => auth != null && typeof auth.code !== 'undefined')
          .map(auth => auth.code)
        : []
    )
    : [];

  const userPermissionCodes = userInfo?.role.permissions.map(p => p.authority.code) ?? [];
  const isDeletePermissionValid = hasPermissionInBoth("DELETE_ORDER", authorityGroupCodes, userPermissionCodes);
  const { mutate: exportPayment } = useExportPayment()
  const { mutate: exportOrderInvoice } = useExportOrderInvoice()
  const { mutate: reprintOrderInvoice, isPending: isReprinting } = useReprintFailedInvoicePrinterJobs()

  const handleExportPayment = (slug: string) => {
    exportPayment(slug, {
      onSuccess: (data: Blob) => {
        showToast(tToast('toast.exportPaymentSuccess'))
        // Load data to print
        loadDataToPrinter(data)
      },
    })
  }

  const handleExportOrderInvoice = async (order: IOrder | undefined) => {
    exportOrderInvoice(order?.slug || '', {
      onSuccess: (data: Blob) => {
        showToast(tToast('toast.exportInvoiceSuccess'))
        // Load data to print
        loadDataToPrinter(data)
      },
    })
  }

  const handleReprintFailedOrderPrinterJobs = (order: IOrder) => {
    reprintOrderInvoice(order.slug, {
      onSuccess: () => {
        showToast(tToast('toast.reprintFailedOrderPrinterJobsSuccess'))
      }
    })
  }

  return [
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('menu.createdAt')} />
      ),
      cell: ({ row }) => {
        const createdAt = row.getValue('createdAt')
        return (
          <div className="text-xs xl:text-sm">
            {createdAt ? moment(createdAt).format('HH:mm DD/MM/YYYY') : ''}
          </div>
        )
      },
    },
    {
      accessorKey: 'exportInvoice',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('order.exportInvoice')} />
      ),
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className="text-xs xl:text-sm">
            {(order.status !== OrderStatus.PENDING) && (
              <div onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="outline"
                  className="flex justify-start w-full gap-1 px-2 text-xs xl:text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportOrderInvoice(order);
                  }}
                >
                  <DownloadIcon />
                  {t('order.exportInvoice')}
                </Button>
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'orderReferenceNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('order.orderReferenceNumber')} />
      ),
      cell: ({ row }) => {
        const order = row.original
        return <div className="text-sm">{order?.referenceNumber || 'N/A'}</div>
      },
    },
    {
      accessorKey: 'paymentMethod',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('order.paymentMethod')}
        />
      ),
      cell: ({ row }) => {
        const order = row.original
        let paymentMethodValue = '';
        if (order?.payment?.paymentMethod === PaymentMethod.CASH) {
          paymentMethodValue = t('order.cash');
        }
        if (order?.payment?.paymentMethod === PaymentMethod.BANK_TRANSFER) {
          paymentMethodValue = t('order.bankTransfer')
        }
        if (order?.payment?.paymentMethod === PaymentMethod.POINT) {
          paymentMethodValue = t('order.point')
        }
        if (order?.payment?.paymentMethod === PaymentMethod.CREDIT_CARD) {
          paymentMethodValue = t('order.creditCard')
        }
        return (
          <div className="flex flex-col">
            <span className="text-[0.8rem]">
              {paymentMethodValue}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'transactionId',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('order.transactionId')}
        />
      ),
      cell: ({ row }) => {
        const order = row.original
        let transactionIdValue = '';
        if (order?.payment?.paymentMethod === PaymentMethod.CREDIT_CARD) {
          transactionIdValue = order?.payment?.transactionId || ''
        }
        return (
          <div className="flex flex-col">
            <span className="text-[0.8rem]">
              {transactionIdValue}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'owner',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('order.owner')} />
      ),
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className="text-sm">
            {order?.owner?.firstName || ''} {order?.owner?.lastName || ''}
          </div>
        )
      },
    },
    {
      accessorKey: 'table',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('order.table')} />
      ),
      cell: ({ row }) => {
        const location = row.original.type === OrderTypeEnum.AT_TABLE ? t('order.at-table') + " " + row.original.table?.name || "" : row.original.type === OrderTypeEnum.TAKE_OUT ? t('order.take-out') : t('order.delivery')
        return <div className="text-sm">{location}</div>
      },
    },
    {
      accessorKey: 'pickupTime',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('menu.pickupTime')} />
      ),
      cell: ({ row }) => {
        const pickupTime = row.original.timeLeftTakeOut

        return row.original.type === OrderTypeEnum.TAKE_OUT ? (
          <div className={`text-sm ${pickupTime === 0 ? 'text-green-600' : 'text-destructive'}`}>
            {pickupTime === 0
              ? t('menu.immediately')
              : pickupTime
                ? `${t('menu.waiting')} ${pickupTime} ${t('menu.minutes')}`
                : ""}
          </div>
        ) : (
          <div className="text-sm">{row.original.type === OrderTypeEnum.AT_TABLE ? t('menu.dineIn') : row.original.type === OrderTypeEnum.TAKE_OUT ? t('order.take-out') : ''}</div>
        )
      },
    },
    {
      accessorKey: 'orderStatus',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('order.orderStatus')} />
      ),
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className="flex flex-col">
            <OrderStatusBadge order={order} />
          </div>
        )
      },
    },
    {
      accessorKey: 'subtotal',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('order.subtotal')} />
      ),
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className="text-sm">{formatCurrency(order?.subtotal || 0)}</div>
        )
      },
    },
    {
      accessorKey: 'printerOrders',
      header: ({ column }) => (
        <DataTableColumnHeader
          key={column.id}
          column={column}
          title={t('order.printerOrders')}
        />
      ),
      cell: ({ row }) => {
        const printerInvoices = row.original.printerInvoices || []

        const countByStatus: Record<PrinterJobType, number> = {
          pending: 0,
          printing: 0,
          printed: 0,
          failed: 0,
        }

        for (const job of printerInvoices) {
          const status = job.status as PrinterJobType
          countByStatus[status]++
        }

        const statusLabels: Record<PrinterJobType, string> = {
          printed: t('order.printed'),   // ví dụ: 'Đã in'
          printing: t('order.printing'), // ví dụ: 'Đang in'
          pending: t('order.pendingPrint'),   // ví dụ: 'Chờ in'
          failed: t('order.failed'),     // ví dụ: 'Lỗi'
        }

        const statusColors: Record<PrinterJobType, string> = {
          printed: 'text-green-600',
          printing: 'text-blue-600',
          pending: 'text-gray-500',
          failed: 'text-red-600',
        }

        return (
          <div className="flex flex-col flex-wrap text-xs font-medium gap-x-3 xl:text-sm">
            {(['printed', 'printing', 'pending', 'failed'] as PrinterJobType[]).map(status => (
              <span key={status} className={statusColors[status]}>
                {statusLabels[status]}: {countByStatus[status]}
              </span>
            ))}
          </div>
        )
      }
    },
    {
      id: 'actions',
      header: tCommon('common.action'),
      cell: ({ row }) => {
        const order = row.original
        const failedJobs = order.printerInvoices?.filter(job => job.status === PrinterJobType.FAILED) || []
        return (
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-8 h-8 p-0">
                  <span className="sr-only">{tCommon('common.action')}</span>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {tCommon('common.action')}
                </DropdownMenuLabel>

                {/* Export invoice */}
                {(order.status !== OrderStatus.PENDING) && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      className="flex justify-start w-full gap-1 px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportOrderInvoice(order);
                      }}
                    >
                      <DownloadIcon />
                      {t('order.exportInvoice')}
                    </Button>
                  </div>
                )}
                {/* Update payment */}
                {order?.slug &&
                  order?.status === OrderStatus.PENDING &&
                  (!order?.payment?.statusCode ||
                    order?.payment.statusCode === paymentStatus.PENDING) && (
                    <NavLink
                      to={`${ROUTE.STAFF_ORDER_PAYMENT}?order=${order.slug}`}
                      className="flex items-center justify-start w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        className="flex justify-start w-full gap-1 px-2 text-sm"
                      >
                        <CreditCard className="icon" />
                        {t('order.updatePayment')}
                      </Button>
                    </NavLink>
                  )
                }

                {/* Update order */}
                {order?.slug &&
                  order?.status === OrderStatus.PENDING &&
                  (!order?.payment || order?.payment?.statusCode === paymentStatus.PENDING) && (
                    <NavLink
                      to={`${ROUTE.STAFF_ORDER_MANAGEMENT}/${order.slug}/update`}
                      className="flex justify-start items-center w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        className="flex justify-start w-full gap-1 px-2 text-sm"
                      >
                        <SquarePen className="icon" />
                        {t('order.updateOrder')}
                      </Button>
                    </NavLink>
                  )
                }

                {/* Create chef order */}
                {order.chefOrders.length === 0 && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <CreateChefOrderDialog
                      order={order}
                    />
                  </div>
                )}

                {/* Export payment */}
                {order?.payment?.slug && order?.payment?.paymentMethod === PaymentMethod.BANK_TRANSFER && order?.payment?.statusCode === paymentStatus.PENDING && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportPayment(order.payment!.slug);
                    }}
                    variant="ghost"
                    className="flex justify-start w-full gap-1 px-2"
                  >
                    <DownloadIcon />
                    {t('order.exportPayment')}
                  </Button>
                )}

                {/* Cancel order */}
                {isDeletePermissionValid &&
                  !(
                    order &&
                    (order.status === OrderStatus.PAID || order.status === OrderStatus.COMPLETED) &&
                    order.payment?.statusCode === paymentStatus.COMPLETED
                  ) && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <OutlineCancelOrderDialog order={order} />
                    </div>
                  )}
                {order.status !== OrderStatus.PENDING && failedJobs.length > 0 ? (
                  <Button
                    disabled={isReprinting}
                    variant="ghost"
                    className="flex justify-start w-full px-2 text-xs xl:text-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleReprintFailedOrderPrinterJobs(order)
                    }}
                  >
                    {isReprinting && <Loader2 className="mr-2 animate-spin" />}
                    <DownloadIcon />
                    {t('order.reprintFailedOrderJobs')}
                  </Button>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}