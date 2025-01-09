import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { ITable } from '@/types'
import { TableStatus } from '@/constants'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui"
import { useUpdateTableStatus } from '@/hooks'
import { useUserStore } from '@/stores'
import { showToast } from '@/utils'
import { DeleteTableDialog, UpdateTableDialog } from '@/components/app/dialog'

interface TableItemProps {
  table: ITable
  isSelected?: boolean
  onClick?: (e: React.MouseEvent) => void
  containerBounds?: DOMRect
}

export function TableItem({
  table,
  isSelected,
  onClick,
}: TableItemProps) {
  const queryClient = useQueryClient()
  const { t: tToast } = useTranslation(['toast'])
  const { getUserInfo } = useUserStore()
  const { mutate: updateTableStatus } = useUpdateTableStatus()
  const handleStatusChange = (tableId: string, status: TableStatus) => {
    // Implement status change logic here
    updateTableStatus(
      { slug: tableId, status },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ['tables', getUserInfo()?.branch.slug],
          })
          showToast(tToast('toast.updateTableStatusSuccess'))
        },
      },
    )
  }

  const getStatusColor = () => {
    switch (table.status) {
      case TableStatus.AVAILABLE:
        return 'bg-muted-foreground/10'
      case TableStatus.RESERVED:
        return 'bg-yellow-500'
      default:
        return 'border-gray-500'
    }
  }

  return (
    <div
      className="mt-4"
      onClick={onClick}
    >
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className={`rounded-md bg-transparent p-2 transition-all duration-200 ${isSelected
              ? 'z-10 scale-110 border-primary bg-primary/10 ring-2 ring-green-500'
              : 'bg-background hover:scale-105 hover:ring-2 hover:ring-primary/50'
              } `}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                {/* <div className={`w-2 h-3/5 rounded-full ${getStatusColor()}`} /> */}
                <div className="flex flex-col items-center gap-2">
                  <div className={`h-2 w-2/3 rounded-full ${getStatusColor()}`} />
                  <div
                    className={`flex cursor-pointer min-w-[6rem] min-h-[4rem] items-center justify-center rounded-md ${getStatusColor()}`}
                  >
                    {/* <span className="flex items-center justify-center p-1 text-sm font-medium bg-white rounded-full h-7 w-7 text-muted-foreground">
                  {table.name}
                </span> */}
                  </div>

                  <div className={`h-2 w-2/3 rounded-full ${getStatusColor()}`} />
                </div>
                {/* <div className={`w-2 h-3/5 rounded-full ${getStatusColor()}`} /> */}
              </div>
              <span className='text-sm font-medium text-muted-foreground'>
                {table.name}
              </span>
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuSub>
            <ContextMenuSubTrigger className='flex justify-start px-2' inset>Thay đổi trạng thái bàn</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              {table.status !== TableStatus.AVAILABLE && (
                <ContextMenuItem onClick={() => handleStatusChange(table.slug, TableStatus.AVAILABLE)}>
                  Đổi thành bàn trống
                </ContextMenuItem>
              )}
              {table.status !== TableStatus.RESERVED && (
                <ContextMenuItem onClick={() => handleStatusChange(table.slug, TableStatus.RESERVED)}>
                  Đổi thành bàn đã đặt
                </ContextMenuItem>
              )}
            </ContextMenuSubContent>
          </ContextMenuSub>
          <UpdateTableDialog table={table} />
          <DeleteTableDialog
            table={table}
          // onContextOpen={() => onOpenChange(false)}
          />
        </ContextMenuContent>
      </ContextMenu>
    </div>
  )
}
