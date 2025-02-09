import { ColumnDef } from '@tanstack/react-table'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { MoreHorizontal, Copy } from 'lucide-react'

import {
  Button,
  DataTableColumnHeader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui'
import { IVoucher } from '@/types'
import { showToast } from '@/utils'
import { UpdateVoucherSheet } from '@/components/app/sheet'
import { DeleteVoucherDialog } from '@/components/app/dialog'

export const useVoucherColumns = (): ColumnDef<IVoucher>[] => {
  const { t } = useTranslation(['voucher'])
  const { t: tCommon } = useTranslation(['common'])
  const { t: tToast } = useTranslation('toast')

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    showToast(tToast('toast.copyCodeSuccess'))
  }

  return [
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('voucher.createdAt')} />
      ),
      cell: ({ row }) => {
        const createdAt = row.getValue('createdAt')
        return (
          <div className="text-xs sm:text-sm">
            {createdAt ? moment(createdAt).format('HH:mm DD/MM/YYYY') : ''}
          </div>
        )
      },
    },
    {
      accessorKey: 'slug',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('voucher.slug')} />
      ),
      cell: ({ row }) => {
        const user = row.original
        return <div className="text-xs sm:text-sm">{user?.slug}</div>
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
          <div className="flex flex-col gap-1 text-xs sm:text-sm">
            {voucher?.title}
            <span className="text-xs text-muted-foreground">
              {voucher.description}
            </span>
          </div>
        )
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
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            {voucher?.code}
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6"
              onClick={() => handleCopyCode(voucher?.code)}
            >
              <Copy className="w-4 h-4 text-primary" />
            </Button>
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
          <div className="text-xs sm:text-sm">{voucher?.minOrderValue}</div>
        )
      },
    },
    {
      id: 'actions',
      header: tCommon('common.action'),
      cell: ({ row }) => {
        const voucher = row.original
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
                <UpdateVoucherSheet voucher={voucher} />
                <DeleteVoucherDialog voucher={voucher} />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}
