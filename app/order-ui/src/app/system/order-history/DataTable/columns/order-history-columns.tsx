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
import ejs from 'ejs'
import QRCode from 'qrcode';


import {
  Button,
  DataTableColumnHeader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui'
import { IExportOrderInvoiceParams, IOrder, OrderStatus, OrderTypeEnum } from '@/types'
import { PaymentMethod, paymentStatus, ROUTE, VOUCHER_TYPE } from '@/constants'
import { useExportPayment, useGetAuthorityGroup } from '@/hooks'
import { formatCurrency, hasPermissionInBoth, loadDataToPrinter, showToast } from '@/utils'
import OrderStatusBadge from '@/components/app/badge/order-status-badge'
import { CreateChefOrderDialog, OutlineCancelOrderDialog } from '@/components/app/dialog'
import { useUserStore } from '@/stores'
import { Be_Vietnam_Pro_base64 } from '@/assets/font/base64'
import { Logo } from '@/assets/images'

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

  const generateQRCodeBase64 = async (slug: string): Promise<string> => {
    try {
      const dataUrl = await QRCode.toDataURL(slug, { width: 128 });
      return dataUrl; // base64 string
    } catch {
      return '';
    }
  };

  const generateInvoiceHTML = async (data: IExportOrderInvoiceParams): Promise<string> => {
    const templateText = await fetch('/templates/invoice-template.html').then(res => res.text());
    return ejs.render(templateText, data);
  };

  const exportOrderInvoices = async (order: IOrder | undefined) => {
    if (!order) return;

    let voucherValue = 0;
    let orderPromotionValue = 0;

    if (order?.voucher?.type === VOUCHER_TYPE.PERCENT_ORDER) {
      const voucherPercent = order.voucher.value;
      const subtotalBeforeVoucher =
        (order.subtotal * 100) / (100 - voucherPercent);
      voucherValue += subtotalBeforeVoucher - order.subtotal;
    }
    if (order?.voucher?.type === VOUCHER_TYPE.FIXED_VALUE) {
      voucherValue += order.voucher.value;
    }

    const subtotalBeforeVoucher = order.orderItems?.reduce(
      (total, current) => total + current.subtotal,
      0,
    );

    // Calculate promotion value 
    orderPromotionValue = order.orderItems.reduce((acc, item) => acc + (item.promotion?.value || 0) * item.quantity, 0);

    try {
      const htmlContent = await generateInvoiceHTML({
        logoString: Be_Vietnam_Pro_base64,
        logo: Logo,
        branchAddress: order.invoice.branchAddress || '',
        referenceNumber: order.invoice.referenceNumber,
        createdAt: order.createdAt,
        type: order.type,
        tableName: order.type === OrderTypeEnum.AT_TABLE ? order.table?.name || '' : 'Mang đi',
        customer: order.owner?.firstName + ' ' + order.owner?.lastName || 'Khách lẻ',
        cashier: order.approvalBy?.firstName + ' ' + order.approvalBy?.lastName || '',
        invoiceItems: order.orderItems.map(item => ({
          variant: {
            name: item.variant.product?.name || '',
            originalPrice: item.variant.price,
            price: item.subtotal,
            size: item.variant.size?.name || ''
          },
          quantity: item.quantity,
          promotionValue: (item.promotion?.value || 0) * item.quantity
        })),
        promotionDiscount: orderPromotionValue,
        paymentMethod: order.payment?.paymentMethod || '',
        subtotalBeforeVoucher: subtotalBeforeVoucher,
        voucherType: order.voucher?.type || '',
        voucherValue: voucherValue,
        amount: order.invoice.amount,
        loss: order.loss,
        qrcode: await generateQRCodeBase64(order.slug),
        formatCurrency: (v: number) => new Intl.NumberFormat().format(v) + '₫',
        formatDate: (date: string, fmt: string) => moment(date).format(fmt),
        formatPaymentMethod: (method: string) => method === 'CASH' ? 'Tiền mặt' : 'Khác',
      });

      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        showToast(tToast('toast.exportPDFVouchersError'));
        return;
      }

      // Write the HTML content to the new window
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for resources to load
      printWindow.onload = () => {
        // Print the window
        printWindow.print();
        // Close the window after printing
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      };
    } catch {
      showToast(tToast('toast.exportPDFVouchersError'));
    }
  };

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
                {(order.status !== OrderStatus.SHIPPING) && (
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