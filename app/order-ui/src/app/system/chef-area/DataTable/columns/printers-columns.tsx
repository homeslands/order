import moment from 'moment'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import {
  Button,
  DataTableColumnHeader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui'
import { IPrinterForCHefArea } from '@/types'
import { MoreHorizontal } from 'lucide-react'
import UpdatePrinterSheet from '@/components/app/sheet/update-printer-sheet'
import { DeletePrinterDialog } from '@/components/app/dialog'
import { PrinterToggleSwitch } from '@/components/app/switch'

export const usePrintersColumns = (): ColumnDef<IPrinterForCHefArea>[] => {
  const { t } = useTranslation(['chefArea'])
  const { t: tCommon } = useTranslation('common')

  return [

    {
      accessorKey: 'toggle',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('printer.toggle')} />
      ),
      cell: ({ row }) => (
        <div className='flex items-center justify-center'>
          <PrinterToggleSwitch
            printer={row.original}
            disabled={!row.original.ip || !row.original.port}
          />
        </div>
      ),
    },

    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('printer.createdAt')} />
      ),
      cell: ({ row }) => {
        const createdAt = new Date(row.original.createdAt)
        return (
          <span>
            {moment(createdAt).format('HH:mm:ss DD/MM/YYYY')}
          </span>
        )
      },
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('printer.name')} />
      ),
    },

    {
      accessorKey: 'dataType',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('printer.dataType')} />
      ),
      cell: ({ row }) => {
        const dataType = row.original.dataType
        return (
          <span>
            {dataType.toUpperCase()}
          </span>
        )
      },
    },
    {
      accessorKey: 'ip',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('printer.ip')} />
      ),
      cell: ({ row }) => {
        const ip = row.original.ip
        return (
          <span>
            {ip ? ip : t('printer.noIpAvailable')}
          </span>
        )
      },
    },
    {
      accessorKey: 'port',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('printer.port')} />
      ),
      cell: ({ row }) => {
        const port = row.original.port
        return (
          <span>
            {port ? port : t('printer.noPortAvailable')}
          </span>
        )
      },
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('printer.description')} />
      ),
      cell: ({ row }) => {
        const description = row.original.description
        return (
          <span>
            {description ? description : t('printer.noDescriptionAvailable')}
          </span>
        )
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('printer.status')} />
      ),
      cell: ({ row }) => {
        const isActive = row.original.isActive
        return (
          <span className={isActive ? 'text-green-500' : 'text-destructive'}>
            {isActive ? t('printer.active') : t('printer.inactive')}
          </span>
        )
      },
    },

    {
      id: 'actions',
      header: tCommon('common.action'),
      cell: ({ row }) => {
        const chefOrder = row.original
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
                <UpdatePrinterSheet
                  printer={chefOrder}
                />
                <DeletePrinterDialog
                  printer={chefOrder}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}

