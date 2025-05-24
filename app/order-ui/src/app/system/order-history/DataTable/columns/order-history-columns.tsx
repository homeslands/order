import { createRoot } from 'react-dom/client'
import { NavLink } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import {
  MoreHorizontal,
  CreditCard,
  DownloadIcon,
  SquarePen,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import jsPDF from 'jspdf'
import moment from 'moment'
import { QRCodeSVG } from 'qrcode.react'

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
import { useExportPayment, useGetAuthorityGroup } from '@/hooks'
import { formatCurrency, hasPermissionInBoth, loadDataToPrinter, showToast } from '@/utils'
import OrderStatusBadge from '@/components/app/badge/order-status-badge'
import { CreateChefOrderDialog, OutlineCancelOrderDialog } from '@/components/app/dialog'
import { useUserStore } from '@/stores'
import { Be_Vietnam_Pro_base64 } from '@/assets/font/base64'

export const useOrderHistoryColumns = (): ColumnDef<IOrder>[] => {
  const { t } = useTranslation(['menu'])
  const { t: tToast } = useTranslation(['toast'])
  const { t: tCommon } = useTranslation(['common'])
  const { userInfo } = useUserStore()
  const { data: authorityData } = useGetAuthorityGroup({})
  const authorityGroup = authorityData?.result ?? [];
  const authorityGroupCodes = authorityGroup.flatMap(group => group.authorities.map(auth => auth.code));
  const userPermissionCodes = userInfo?.role.permissions.map(p => p.authority.code) ?? [];
  const isDeletePermissionValid = hasPermissionInBoth("DELETE_ORDER", authorityGroupCodes, userPermissionCodes);
  // const { mutate: exportOrderInvoice } = useExportOrderInvoice()
  const { mutate: exportPayment } = useExportPayment()

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
    await exportOrderInvoices(order)
    showToast(tToast('toast.exportPDFVouchersSuccess'))
  }

  const exportOrderInvoices = async (order: IOrder | undefined) => {
    if (!order) return

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'cm',
      format: [5, 3],
    })

    try {
      // Add font directly since it's already base64 encoded
      pdf.addFileToVFS('BeVietnamPro-Regular.ttf', Be_Vietnam_Pro_base64)
      pdf.addFont('BeVietnamPro-Regular.ttf', 'BeVietnamPro', 'normal')
      pdf.setFont('BeVietnamPro', 'normal')
      pdf.setFontSize(6)

      // Create temporary container for QR code
      const container = document.createElement('div')
      const root = createRoot(container)
      root.render(
        <QRCodeSVG
          value={order.slug || ''}
          size={96}
          level="H"
          includeMargin={true}
          bgColor="#ffffff"
          fgColor="#000000"
        />
      )

      // Wait for QR code to be rendered
      await new Promise(resolve => setTimeout(resolve, 100))

      const pageWidth = 5
      const qrSize = 1.6
      const qrX = (pageWidth - qrSize) / 2
      const qrY = 0.3
      const textYStart = qrY + qrSize + 0.4
      const lineSpacing = 0.3

      // Convert SVG to PNG
      const svgElement = container.querySelector('svg')
      if (!svgElement) throw new Error('QR code SVG not found')

      const svgData = new XMLSerializer().serializeToString(svgElement)
      const canvas = document.createElement('canvas')
      canvas.width = 96
      canvas.height = 96
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not get canvas context')

      const img = new Image()
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)

      await new Promise((resolve, reject) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0)
          URL.revokeObjectURL(url)
          resolve(null)
        }
        img.onerror = () => {
          URL.revokeObjectURL(url)
          reject(new Error('Failed to load SVG image'))
        }
        img.src = url
      })

      // Add QR code to PDF
      const pngData = canvas.toDataURL('image/png')
      pdf.addImage(pngData, 'PNG', qrX, qrY, qrSize, qrSize)

      // Text config
      const codeLine = `Thời gian: ${moment(order.createdAt).format('DD/MM/YYYY')}`
      const dateLine = `Hóa đơn: ${order.referenceNumber}`
      const textX = pageWidth / 2

      pdf.text(codeLine, textX, textYStart, { align: 'center' })
      pdf.text(dateLine, textX, textYStart + lineSpacing, { align: 'center' })

      const pdfBlob = pdf.output('blob')
      loadDataToPrinter(pdfBlob)
    } catch {
      showToast(tToast('toast.exportPDFVouchersError'))
    }
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
          <div className="text-sm">
            {createdAt ? moment(createdAt).format('HH:mm DD/MM/YYYY') : ''}
          </div>
        )
      },
    },
    // {
    //   accessorKey: 'slug',
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title={t('order.slug')} />
    //   ),
    //   cell: ({ row }) => {
    //     const order = row.original
    //     return <div className="text-sm">{order?.slug || 'N/A'}</div>
    //   },
    // },
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
    // {
    //   accessorKey: 'paymentStatus',
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title={t('order.paymentStatus')} />
    //   ),
    //   cell: ({ row }) => {
    //     return (
    //       <div className="flex flex-col">
    //         <PaymentStatusBadge status={row?.original?.payment?.statusCode || paymentStatus.PENDING} />
    //       </div>
    //     )
    //   },
    // },
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
                    // onOpenChange={onDialogOpenChange}
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


                {/* {order?.slug &&
                  order?.payment?.statusCode === paymentStatus.COMPLETED && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportOrderInvoice(order.slug);
                      }}
                      variant="ghost"
                      className="flex gap-1 justify-start px-2 w-full"
                    >
                      <DownloadIcon />
                      {t('order.exportInvoice')}
                    </Button>
                  )} */}

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
