import { NavLink } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import {
  MoreHorizontal,
  CreditCard,
  DownloadIcon,
  SquarePen,
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
import { PaymentMethod, paymentStatus, ROUTE } from '@/constants'
import { useExportOrderInvoice, useExportPayment, useGetAuthorityGroup } from '@/hooks'
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
                  className="flex gap-1 justify-start px-2 w-full text-xs xl:text-sm"
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
        return (
          <div className="flex flex-col">
            <span className="text-[0.8rem]">
              {order?.payment &&
                order?.payment?.paymentMethod === PaymentMethod.CASH
                ? t('order.cash')
                : t('order.bankTransfer')}
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
        const location = row.original.type === OrderTypeEnum.AT_TABLE ? t('order.at-table') + " " + row.original.table?.name || "" : t('order.take-out')
        return <div className="text-sm">{location}</div>
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
      id: 'actions',
      header: tCommon('common.action'),
      cell: ({ row }) => {
        const order = row.original
        return (
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 w-8 h-8">
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
                      className="flex gap-1 justify-start px-2 w-full"
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
                      className="flex justify-start items-center w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        className="flex gap-1 justify-start px-2 w-full text-sm"
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
                      to={`${ROUTE.STAFF_ORDER_HISTORY}/${order.slug}/update`}
                      className="flex justify-start items-center w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        className="flex gap-1 justify-start px-2 w-full text-sm"
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
                    className="flex gap-1 justify-start px-2 w-full"
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}