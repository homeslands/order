import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { MoreHorizontal, Copy } from 'lucide-react'

import {
  Button,
  DataTableColumnHeader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui'
import { IVoucher } from '@/types'
import { formatCurrency, showToast } from '@/utils'
import { UpdateVoucherSheet } from '@/components/app/sheet'
import { DeleteVoucherDialog } from '@/components/app/dialog'
import moment from 'moment'
import { VOUCHER_TYPE } from '@/constants'

export const useVoucherColumns = (onSuccess: () => void): ColumnDef<IVoucher>[] => {
  const { t } = useTranslation(['voucher'])
  const { t: tCommon } = useTranslation(['common'])
  const { t: tToast } = useTranslation('toast')

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    showToast(tToast('toast.copyCodeSuccess'))
  }

  const handleUpdateVoucherSuccess = () => {
    onSuccess()
  }

  return [
    {
      accessorKey: 'slug',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('voucher.slug')} />
      ),
      cell: ({ row }) => {
        const user = row.original
        return <div className="text-xs">{user?.slug}</div>
      },
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('voucher.title')} />
      ),
      cell: ({ row }) => {
        const voucher = row.original
        return (
          <div className="flex flex-col gap-1 w-[16rem]">
            {voucher?.title}
            <span className="text-xs text-muted-foreground">
              {voucher.description}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('voucher.type')} />
      ),
      cell: ({ row }) => {
        const voucher = row.original
        return <div className="text-xs sm:text-sm">{voucher?.type === VOUCHER_TYPE.FIXED_VALUE ? t('voucher.fixedValue') : t('voucher.percentOrder')}</div>
      },
    },
    {
      accessorKey: 'startDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('voucher.time')} />
      ),
      cell: ({ row }) => {
        const voucher = row.original
        return <div className="text-xs min-w-[13rem] sm:text-sm">{moment(voucher?.startDate).format('DD/MM/YYYY')} - {moment(voucher?.endDate).format('DD/MM/YYYY')}</div>
      },
    },
    {
      accessorKey: 'code',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('voucher.code')} />
      ),
      cell: ({ row }) => {
        const voucher = row.original
        return (
          <div className="flex gap-2 items-center text-xs sm:text-sm">
            {voucher?.code}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6"
                    onClick={() => handleCopyCode(voucher?.code)}
                  >
                    <Copy className="w-4 h-4 text-primary" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {t('voucher.copyCode')}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )
      },
    },
    {
      accessorKey: 'maxUsage',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('voucher.maxUsage')} />
      ),
      cell: ({ row }) => {
        const voucher = row.original
        return <div className="text-xs sm:text-sm">{voucher?.maxUsage}</div>
      },
    },
    {
      accessorKey: 'remainingUsage',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('voucher.remainingUsage')} />
      ),
      cell: ({ row }) => {
        const voucher = row.original
        return <div className="text-xs sm:text-sm">{voucher?.remainingUsage}</div>
      },
    },
    {
      accessorKey: 'value',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('voucher.value')} />
      ),
      cell: ({ row }) => {
        const voucher = row.original
        return <div className="text-xs sm:text-sm">
          {voucher?.type === VOUCHER_TYPE.FIXED_VALUE ? formatCurrency(voucher?.value) : `${voucher?.value}%`}
        </div>
      },
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('voucher.activeStatus')} />
      ),
      cell: ({ row }) => {
        const voucher = row.original;
        const isActive = voucher?.isActive === true;

        return (
          <div
            className={`text-xs sm:text-sm min-w-[8rem] italic font-medium ${isActive ? 'text-green-500' : 'text-destructive'
              }`}
          >
            {isActive ? t('voucher.active') : t('voucher.inactive')}
          </div>
        );
      },
    },
    {
      accessorKey: 'minOrderValue',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('voucher.minOrderValue')}
        />
      ),
      cell: ({ row }) => {
        const voucher = row.original
        return (
          <div className="text-xs sm:text-sm">{formatCurrency(voucher?.minOrderValue)}</div>
        )
      },
    },
    {
      id: 'actions',
      header: tCommon('common.action'),
      cell: ({ row }) => {
        const voucher = row.original
        return (
          <div className='w-[4rem]'>
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
                <UpdateVoucherSheet voucher={voucher} onSuccess={handleUpdateVoucherSuccess} />
                <DeleteVoucherDialog voucher={voucher} />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}
