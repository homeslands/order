import moment from 'moment'
import { ColumnDef } from '@tanstack/react-table'
import ejs from 'ejs'
import { useTranslation } from 'react-i18next'
import { DownloadIcon, Loader2, MoreHorizontal } from 'lucide-react'

import {
  Button,
  DataTableColumnHeader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui'
import { ChefOrderItemStatus, ChefOrderStatus, IChefOrders, IExportChefOrderParams, IExportChefOrderTicketParams, OrderTypeEnum } from '@/types'
import {
  ConfirmCompleteChefOrderDialog,
  ConfirmUpdateChefOrderStatusDialog,
} from '@/components/app/dialog'
import { ChefOrderStatusBadge } from '@/components/app/badge'
import { openPrintWindow, showToast } from '@/utils'
import { Be_Vietnam_Pro_base64 } from '@/assets/font/base64';
import { Logo } from '@/assets/images';
import { useUserStore } from '@/stores'
import { PrinterJobType } from '@/constants'
import { useReprintFailedChefOrderPrinterJobs, useReprintFailedLabelPrinterJobs } from '@/hooks'

const CHEF_ORDER_TEMPLATE = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Danh sách món</title>
  <style>
    @font-face {
      font-family: 'Be Vietnam Pro';
      src: url('data:font/woff2;base64,<%= logoString %>') format('woff2');
    }

    @page {
      size: 80mm auto;
      margin: 0;
    }

    body {
      font-family: 'Be Vietnam Pro', sans-serif;
      width: 80mm;
      margin: 0 auto;
      padding: 12px;
      font-size: 12px;
      color: #000;
      line-height: 1.5;
    }

    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .font-bold { font-weight: bold; }
    .text-xs { font-size: 10px; }
    .text-sm { font-size: 12px; }
    .text-lg { font-size: 16px; }

    .qr {
      width: 100px;
      display: block;
      margin: 10px auto;
    }

    hr {
      border: none;
      border-top: 1px dashed #000;
      margin: 12px 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
    }

    th, td {
      padding: 5px 4px;
      vertical-align: top;
    }

    th {
      font-size: 11px;
      text-align: left;
      border-bottom: 1px solid #000;
    }

    tbody tr:not(:last-child) td {
      border-bottom: 1px dotted #ccc;
    }

    .section {
      margin-bottom: 14px;
    }

    .total-section td {
      padding: 6px 4px;
    }

    .total-bold {
      font-size: 14px;
      font-weight: bold;
    }

    .uppercase { text-transform: uppercase; }
    .mt-1 { margin-top: 4px; }
    .mb-1 { margin-bottom: 6px; }
    .mb-2 { margin-bottom: 10px; }
    .mb-3 { margin-bottom: 14px; }
  </style>
</head>
<body>

  <!-- Logo + địa chỉ -->
  <div class="text-center section">
    <img src="<%= logo %>" alt="Logo" width="140">
    <div class="mt-1 text-xs">Mã đơn: <%= referenceNumber %></div>
    <div class="mt-1 text-xs">Chi nhánh: <%= branchName %></div>
  </div>

  <!-- Thông tin hóa đơn -->
  <div class="section">
    <div class="text-xs">Thời gian: <%= formatDate(createdAt, 'HH:mm:ss DD/MM/YYYY') %></div>
    <div class="text-xs">Bàn: <%= tableName %></div>
    <div class="mt-4 text-sm font-extrabold">
      Ghi chú: <%= note && note.trim() !== '' ? note : 'Không có ghi chú' %>
    </div>
  </div>
  <hr>

  <!-- Danh sách món -->
  <table>
    <thead>
      <tr>
        <th style="width: 30%;">Món</th>
        <th style="width: 20%;">Size</th>
        <th style="width: 10%;">SL</th>
        <th style="width: 20%;">Ghi chú</th>
      </tr>
    </thead>
    <tbody>
      <% invoiceItems.forEach(function(item) { %>
      <tr>
        <td class="text-xs"><%= item.variant.name.toUpperCase() %></td>
        <td class="text-xs"><%= item.variant.size.toUpperCase() %></td>
        <td class="text-xs"><%= item.quantity %></td>
        <td class="text-xs"><%= item.note %></td>
      </tr>
      <% }); %>
    </tbody>
  </table>
</body>
</html>
`;

const CHEF_ORDER_TICKET_TEMPLATE = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Nhãn bếp</title>
  <style>
    @font-face {
      font-family: 'Be Vietnam Pro';
      src: url('data:font/woff2;base64,<%= logoString %>') format('woff2');
    }

    @page {
      size: 5cm 3cm;
      margin: 0;
    }

    body {
      font-family: 'Be Vietnam Pro', sans-serif;
      width: 5cm;
      height: 3cm;
      margin: 0px;
      padding: 0.2cm;
      font-size: 10px;
      color: #000;
      line-height: 1.2;
      box-sizing: border-box;
    }

    .text-center { text-align: center; }
    .font-bold { font-weight: bold; }
    .text-xs { font-size: 8px; }
    .text-sm { font-size: 10px; }
    .text-lg { font-size: 12px; }
    .mb-1 { margin-bottom: 2px; }
    .mb-2 { margin-bottom: 4px; }

    .item {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2px;
    }

    .logo {
      width: 90px;
      height: auto;
    }

    .reference {
      font-size: 8px;
      text-align: right;
    }

    .divider {
      border: none;
      border-top: 1px dashed #000;
      margin: 2px 0;
    }

    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 0 0.1cm;
    }

    .item-name {
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 1px;
    }

    .item-note {
      font-size: 8px;
      font-style: italic;
      color: #444;
    }
  </style>
</head>
<body>
  <div class="item">
    <div class="header">
      <img src="<%= logo %>" alt="Logo" class="logo">
      <div class="reference">Mã đơn: <%= referenceNumber %></div>
    </div>
    <hr class="divider">
    <div class="content">
      <div class="item-name"><%= orderItem.variant.name %></div>
      <div class="item-note"><%= orderItem.variant.note || 'Không có ghi chú' %></div>
    </div>
  </div>
</body>
</html>`;

export const usePendingChefOrdersColumns = ({ onSuccess }: { onSuccess?: () => void }): ColumnDef<IChefOrders>[] => {
  const { t } = useTranslation(['chefArea'])
  const { t: tCommon } = useTranslation(['common'])
  const { t: tToast } = useTranslation('toast')
  const { userInfo } = useUserStore()
  const { mutate: reprintFailedChefOrderJobs, isPending: isReprintingFailedChefOrderJobs } = useReprintFailedChefOrderPrinterJobs()
  const { mutate: reprintFailedLabelJobs, isPending: isReprintingFailedLabelJobs } = useReprintFailedLabelPrinterJobs()


  const handleExportChefOrder = async (chefOrder: IChefOrders | undefined) => {
    await exportChefOrder(chefOrder)
    showToast(tToast('toast.exportChefOrderSuccess'))
  }

  const handleExportChefOrderTicket = async (chefOrder: IChefOrders | undefined) => {
    await exportChefOrderTicket(chefOrder)
    showToast(tToast('toast.exportChefOrderSuccess'))
  }

  const generateChefOrderHTML = async (data: IExportChefOrderParams): Promise<string> => {
    const templateText = CHEF_ORDER_TEMPLATE;
    return ejs.render(templateText, data);
  };

  const generateChefOrderTicketHTML = async (data: IExportChefOrderTicketParams): Promise<string> => {
    const templateText = CHEF_ORDER_TICKET_TEMPLATE;
    return ejs.render(templateText, data);
  };

  const exportChefOrderTicket = async (chefOrder: IChefOrders | undefined) => {
    if (!chefOrder) return;

    try {
      let allHtmlContent = '';

      for (const item of chefOrder.chefOrderItems) {
        const html = await generateChefOrderTicketHTML({
          logoString: Be_Vietnam_Pro_base64,
          logo: Logo,
          referenceNumber: chefOrder.order.referenceNumber,
          orderItem: {
            variant: {
              name: item.orderItem.variant.product?.name || '',
              size: item.orderItem.variant.size?.name || '',
              note: item.orderItem.note || ''
            },
            quantity: item.orderItem.quantity,
          },
        });

        allHtmlContent += html;
      }

      openPrintWindow(allHtmlContent)

      // Mở cửa sổ in 1 lần
      // const printWindow = window.open('', '_blank');
      // if (!printWindow) {
      //   showToast(tToast('toast.exportChefOrderTicketError'));
      //   return;
      // }

      // printWindow.document.write(allHtmlContent);
      // printWindow.document.close();

      // printWindow.onload = () => {
      //   printWindow.print();
      //   printWindow.onafterprint = () => printWindow.close();
      // };
    } catch {
      showToast(tToast('toast.exportChefOrderTicketError'));
    }
  };

  const exportChefOrder = async (chefOrder: IChefOrders | undefined) => {
    if (!chefOrder) return;

    try {
      let allHtmlContent = '';

      const html = await generateChefOrderHTML({
        logoString: Be_Vietnam_Pro_base64,
        logo: Logo,
        branchName: userInfo?.branch?.name || '',
        referenceNumber: chefOrder?.order?.referenceNumber,
        createdAt: chefOrder?.createdAt,
        type: chefOrder?.order?.type,
        tableName: chefOrder?.order?.type === OrderTypeEnum.AT_TABLE ? chefOrder?.order.table?.name || '' : 'Mang đi',
        note: chefOrder?.order?.description || '',
        invoiceItems: chefOrder?.chefOrderItems.map(item => ({
          variant: {
            name: item?.orderItem?.variant?.product?.name || '',
            size: item?.orderItem?.variant?.size?.name || '',
          },
          quantity: item?.defaultQuantity,
          note: item?.orderItem?.note || ''
        })),
        formatDate: (date: string, fmt: string) => moment(date).format(fmt),
      });

      allHtmlContent += html;

      openPrintWindow(allHtmlContent)

      // Mở cửa sổ in 1 lần
      // const printWindow = window.open('', '_blank');
      // if (!printWindow) {
      //   showToast(tToast('toast.exportChefOrderTicketError'));
      //   return;
      // }

    } catch {
      showToast(tToast('toast.exportChefOrderTicketError'));
    }
  };

  const handleReprintFailedChefOrderPrinterJobs = async (chefOrder: IChefOrders | undefined) => {
    if (!chefOrder) return;
    await Promise.all([
      reprintFailedChefOrderJobs(chefOrder.slug, {
        onSuccess: () => showToast(tToast('toast.reprintFailedChefOrderSuccess')),
      })
    ]);
  };

  const handleReprintFailedLabelPrinterJobs = async (chefOrder: IChefOrders | undefined) => {
    if (!chefOrder) return;
    await Promise.all([
      reprintFailedLabelJobs(chefOrder.slug, {
        onSuccess: () => showToast(tToast('toast.reprintFailedLabelJobsSuccess')),
      }),
    ]);
  };

  return [
    {
      id: 'select',
      header: ({ column }) => (
        <DataTableColumnHeader
          className='min-w-24'
          column={column}
          title={tCommon('common.action')}
        />
      ),
      cell: ({ row }) => {
        const chefOrder = row.original
        return (
          <>
            {chefOrder.status === ChefOrderStatus.PENDING ? (
              <div className='min-w-24' onClick={(e) => e.stopPropagation()}>
                <ConfirmUpdateChefOrderStatusDialog chefOrder={chefOrder} onSuccess={onSuccess} />
              </div>
            ) : (
              <div className="pl-3 min-w-28">
                <span className="text-xs italic text-green-500 xl:text-sm">
                  {t('chefOrder.accepted')}
                </span>
              </div>
            )}
          </>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'export',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('chefOrder.export')} />
      ),
      cell: ({ row }) => {
        const chefOrder = row.original
        return (
          chefOrder.status !== ChefOrderStatus.PENDING ? (
            <Button variant="outline" className='text-xs xl:text-sm' onClick={(e) => {
              e.stopPropagation()
              handleExportChefOrder(chefOrder)
            }}
            >
              <DownloadIcon />
              {t('chefOrder.exportChefOrder')}
            </Button>
          ) : null
        )
      },
    },
    {
      accessorKey: 'exportTicket',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('chefOrder.exportTicket')} />
      ),
      cell: ({ row }) => {
        const chefOrder = row.original
        return (
          chefOrder.status !== ChefOrderStatus.PENDING ? (
            <Button variant="outline" className='text-xs xl:text-sm' onClick={(e) => {
              e.stopPropagation()
              handleExportChefOrderTicket(chefOrder)
            }}
            >
              <DownloadIcon />
              {t('chefOrder.exportTicket')}
            </Button>
          ) : null
        )
      },
    },
    {
      accessorKey: 'referenceNumber',
      header: ({ column }) => (
        <DataTableColumnHeader key={column.id} column={column} title={t('chefOrder.referenceNumber')} />
      ),
      cell: ({ row }) => {
        const referenceNumber = row.original.order.referenceNumber
        return <span className="text-xs text-muted-foreground xl:text-sm">{referenceNumber}</span>
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('chefOrder.createdAt')}
        />
      ),
      cell: ({ row }) => {
        const createdAt = row.getValue('createdAt')
        return (
          <span className="text-xs text-muted-foreground xl:text-sm">
            {createdAt ? moment(createdAt).format('HH:mm DD/MM/YYYY') : ''}
          </span>
        )
      },
    },
    {
      accessorKey: 'location',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('chefOrder.location')} />
      ),
      cell: ({ row }) => {
        const location = row.original.order.type === OrderTypeEnum.AT_TABLE ? t('chefOrder.table') + " " + row.original.order.table.name : t('chefOrder.take-out')
        return <span className="text-xs text-muted-foreground xl:text-sm">{location}</span>
      },
    },
    {
      accessorKey: 'quantity',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('chefOrder.quantity')} />
      ),
      cell: ({ row }) => {
        const quantity = row.original.chefOrderItems.length
        return (
          <span className="text-xs text-muted-foreground xl:text-sm">
            {quantity} {t('chefOrder.items')}
          </span>
        )
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('chefOrder.status')} />
      ),
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <span className="text-muted-foreground">
            <ChefOrderStatusBadge status={status} />
          </span>
        )
      },
    },
    {
      accessorKey: 'printerChefOrders',
      header: ({ column }) => (
        <DataTableColumnHeader
          key={column.id}
          column={column}
          title={t('chefOrder.printerChefOrders')}
        />
      ),
      cell: ({ row }) => {
        const printerChefOrders = row.original.printerChefOrders || []

        const countByStatus: Record<PrinterJobType, number> = {
          pending: 0,
          printing: 0,
          printed: 0,
          failed: 0,
        }

        for (const job of printerChefOrders) {
          const status = job.status as PrinterJobType
          countByStatus[status]++
        }

        const statusLabels: Record<PrinterJobType, string> = {
          printed: t('chefOrder.printed'),   // ví dụ: 'Đã in'
          printing: t('chefOrder.printing'), // ví dụ: 'Đang in'
          pending: t('chefOrder.pendingPrint'),   // ví dụ: 'Chờ in'
          failed: t('chefOrder.failed'),     // ví dụ: 'Lỗi'
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
      accessorKey: 'printerLabels',
      header: ({ column }) => (
        <DataTableColumnHeader
          key={column.id}
          column={column}
          title={t('chefOrder.printerLabels')}
        />
      ),
      cell: ({ row }) => {
        const printerLabels = row.original.printerLabels || []

        const countByStatus: Record<PrinterJobType, number> = {
          pending: 0,
          printing: 0,
          printed: 0,
          failed: 0,
        }

        for (const job of printerLabels) {
          const status = job.status as PrinterJobType
          countByStatus[status]++
        }

        const totalJobs = Object.values(countByStatus).reduce((sum, value) => sum + value, 0)

        // ❌ Nếu tất cả đều là 0 thì không render
        if (totalJobs === 0) return null

        const statusLabels: Record<PrinterJobType, string> = {
          printed: t('chefOrder.printed'),
          printing: t('chefOrder.printing'),
          pending: t('chefOrder.pendingPrint'),
          failed: t('chefOrder.failed'),
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
        const chefOrder = row.original
        const failedJobs = chefOrder.printerChefOrders?.filter(job => job.status === PrinterJobType.FAILED)
        return (
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-8 h-8 p-0">
                  <span className="sr-only">{tCommon('common.action')}</span>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="flex flex-col gap-2">
                <DropdownMenuLabel>
                  {tCommon('common.action')}
                </DropdownMenuLabel>
                {chefOrder.chefOrderItems.some(item => item.status === ChefOrderItemStatus.COMPLETED) && chefOrder.status !== ChefOrderStatus.COMPLETED && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <ConfirmCompleteChefOrderDialog chefOrder={chefOrder} />
                  </div>
                )}
                {chefOrder.status !== ChefOrderStatus.PENDING && failedJobs.length > 0 ? (
                  <Button
                    disabled={isReprintingFailedChefOrderJobs}
                    variant="ghost"
                    className="flex justify-start w-full px-2 text-xs xl:text-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleReprintFailedChefOrderPrinterJobs(chefOrder)
                    }}
                  >
                    {isReprintingFailedChefOrderJobs && <Loader2 className="mr-2 animate-spin" />}
                    <DownloadIcon />
                    {t('chefOrder.reprintFailedChefOrderJobs')}
                  </Button>
                ) : null}
                {chefOrder.status !== ChefOrderStatus.PENDING && failedJobs ? (
                  <Button
                    disabled={isReprintingFailedLabelJobs}
                    variant="ghost"
                    className="flex justify-start w-full px-2 text-xs xl:text-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleReprintFailedLabelPrinterJobs(chefOrder)
                    }}
                  >
                    {isReprintingFailedLabelJobs && <Loader2 className="mr-2 animate-spin" />}
                    <DownloadIcon />
                    {t('chefOrder.reprintFailedLabelJobs')}
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
