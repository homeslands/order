import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useTables } from '@/hooks'
import { useCartItemStore } from '@/stores'
import { useUserStore } from '@/stores'
import { ITable } from '@/types'
import SelectReservedTableDialog from '@/components/app/dialog/select-reserved-table-dialog'
import { NonResizableTableItem } from '../../../app/system/table'

export default function SystemTableSelect() {
  const { t } = useTranslation(['table'])
  const { getUserInfo } = useUserStore()
  const { data: tables } = useTables(getUserInfo()?.branch.slug)
  const [selectedTableId, setSelectedTableId] = useState<string | undefined>(
    undefined,
  )
  const { getCartItems, addTable, removeTable } = useCartItemStore()
  const cartItems = getCartItems()
  const [reservedTable, setReservedTable] = useState<ITable | null>(null)

  useEffect(() => {
    const addedTable = cartItems?.table
    if (addedTable) {
      setSelectedTableId(addedTable)
    }
  }, [cartItems?.table])

  const handleTableClick = (table: ITable) => {
    if (selectedTableId === table.slug) {
      // Remove table for any status
      setSelectedTableId(undefined)
      removeTable()
    } else {
      if (table.status === 'reserved') {
        setReservedTable(table) // Show confirmation dialog
      } else if (table.status === 'available') {
        setSelectedTableId(table.slug)
        addTable(table)
      }
    }
  }

  const confirmAddReservedTable = (table: ITable) => {
    setSelectedTableId(table.slug)
    addTable(table)
    setReservedTable(null) // Close the dialog
  }

  return (
    <div className="mt-6 rounded-md border">
      <div className="flex flex-col items-start justify-between gap-2 bg-muted/60 p-4 sm:flex-row">
        <span className="text-md font-medium">{t('table.title')}</span>
        {/* Table status */}
        <div className="flex gap-2 text-xs sm:flex-row sm:gap-4 sm:px-4">
          <div className="flex flex-row items-center gap-2">
            <div className="h-4 w-4 rounded-sm border bg-muted-foreground/10" />
            <span className="sm:text-sm">{t('table.available')}</span>
          </div>
          <div className="flex flex-row items-center gap-2">
            <div className="h-4 w-4 rounded-sm bg-yellow-500" />
            <span className="sm:text-sm">{t('table.reserved')}</span>
          </div>
          <div className="flex flex-row items-center gap-2">
            <div className="h-4 w-4 rounded-sm border-2 border-green-500 bg-muted-foreground/10" />
            <span className="sm:text-sm">{t('table.selected')}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 p-4">
        {tables?.result.map((table) => (
          <NonResizableTableItem
            key={table.slug}
            table={table}
            isSelected={selectedTableId === table.slug}
            onClick={() => handleTableClick(table)}
          />
        ))}
      </div>
      {reservedTable && (
        <SelectReservedTableDialog
          table={reservedTable}
          setSelectedTableId={setSelectedTableId}
          onConfirm={confirmAddReservedTable}
          onCancel={() => setReservedTable(null)} // Close dialog on cancel
        />
      )}
    </div>
  )
}
