import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { useTables, useUpdateOrderType } from '@/hooks'
import { useBranchStore } from '@/stores'
import { IOrder, ITable, IUpdateOrderTypeRequest, OrderTypeEnum } from '@/types'
import SelectReservedTableDialog from '@/components/app/dialog/select-reserved-table-dialog'
import { NonResizableTableItem } from '../table'
import { TableStatus } from '@/constants'
import { showToast } from '@/utils'
import { SelectedTableToRemoveDialog } from '@/components/app/dialog'

interface ClientTableSelectProps {
  order?: IOrder
  defaultValue?: string
  onSuccess: () => void
}

export default function ClientUpdateOrderTableSelect({ order, defaultValue, onSuccess }: ClientTableSelectProps) {
  const { t } = useTranslation(['table'])
  const { t: tToast } = useTranslation('toast')
  const { branch } = useBranchStore()
  const { slug } = useParams()
  const { data: tables } = useTables(branch?.slug)
  const { mutate: updateOrderType } = useUpdateOrderType()

  const [selectedTableId, setSelectedTableId] = useState<string | undefined>(undefined)
  const [dialogState, setDialogState] = useState<{
    type: 'reserve' | 'remove' | null,
    table: ITable | null
  }>({ type: null, table: null })

  useEffect(() => {
    setSelectedTableId(order?.table?.slug || defaultValue)
  }, [order?.table?.slug, defaultValue])

  const handleTableClick = (table: ITable) => {
    if (table.status === TableStatus.RESERVED) {
      if (table.slug === selectedTableId) {
        setDialogState({ type: 'remove', table })
      } else {
        setDialogState({ type: 'reserve', table })
      }
    } else if (table.status === TableStatus.AVAILABLE) {
      updateTableSelection(table.slug)
    }
  }

  const updateTableSelection = (tableSlug: string | null) => {
    const params: IUpdateOrderTypeRequest = {
      type: order?.type || OrderTypeEnum.AT_TABLE,
      table: tableSlug,
    }

    updateOrderType(
      { slug: slug as string, params },
      {
        onSuccess: () => {
          showToast(tToast('toast.updateOrderTypeSuccess'))
          setSelectedTableId(tableSlug || undefined)
          onSuccess()
          setDialogState({ type: null, table: null })
        }
      }
    )
  }

  const handleDialogClose = () => {
    setDialogState({ type: null, table: null })
  }

  return (
    <div className="flex flex-col w-full mt-6 border rounded-md">
      <div className="flex flex-col items-start justify-between gap-2 p-4 bg-muted/60 sm:flex-row">
        <span className="font-medium text-md">{t('table.title')}</span>
        <div className="flex justify-between w-full gap-2 text-xs sm:w-fit sm:flex-row sm:gap-4 sm:px-4">
          <div className="flex flex-row items-center gap-2">
            <div className="w-4 h-4 border rounded-sm bg-muted-foreground/10" />
            <span className="text-[0.5rem] sm:text-sm">{t('table.available')}</span>
          </div>
          <div className="flex flex-row items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-sm" />
            <span className="text-[0.5rem] sm:text-sm">{t('table.reserved')}</span>
          </div>
          <div className="flex flex-row items-center gap-2">
            <div className="w-4 h-4 border-2 border-green-500 rounded-sm bg-muted-foreground/10" />
            <span className="text-[0.5rem] sm:text-sm">{t('table.selected')}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-row flex-wrap w-full h-full gap-4 p-4">
        {tables?.result.map((table) => (
          <NonResizableTableItem
            key={table.slug}
            table={table}
            isSelected={selectedTableId === table.slug}
            defaultValue={defaultValue}
            onClick={() => handleTableClick(table)}
          />
        ))}
      </div>

      {dialogState.type === 'reserve' && (
        <SelectReservedTableDialog
          table={dialogState.table!}
          setSelectedTableId={setSelectedTableId}
          onConfirm={() => updateTableSelection(dialogState.table!.slug)}
          onCancel={handleDialogClose}
        />
      )}

      {dialogState.type === 'remove' && (
        <SelectedTableToRemoveDialog
          table={dialogState.table}
          setSelectedTableId={setSelectedTableId}
          onConfirm={() => updateTableSelection(null)}
          onCancel={handleDialogClose}
        />
      )}
    </div>
  )
}
