import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useTables } from '@/hooks'
import { useCartItemStore, useBranchStore } from '@/stores'
import { ITable, OrderTypeEnum } from '@/types'
import SelectReservedTableDialog from '@/components/app/dialog/select-reserved-table-dialog'
import { NonResizableTableItem } from '@/app/system/table'
import { TableStatus } from '@/constants'
import { OrderTypeAlertDialog } from '../dialog'

export default function ClientTableSelect() {
  const { t } = useTranslation(['table'])
  const { branch } = useBranchStore()
  const { data: tables } = useTables(branch?.slug)
  const [openOrderTypeAlert, setOpenOrderTypeAlert] = useState(false)
  const [selectedTableId, setSelectedTableId] = useState<string | undefined>(
    undefined,
  )
  const { getCartItems, addTable, removeTable } = useCartItemStore()
  const cartItems = getCartItems()
  const [reservedTable, setReservedTable] = useState<ITable | null>(null)

  useEffect(() => {
    const addedTable = cartItems?.table
    setSelectedTableId(addedTable)
  }, [cartItems?.table])

  const handleTableClick = (table: ITable) => {
    if (getCartItems()?.type === OrderTypeEnum.TAKE_OUT) {
      setOpenOrderTypeAlert(true)
      return
    }
    if (selectedTableId === table.slug) {
      removeTable()
      return
    }
    if (table.status === TableStatus.RESERVED) {
      setReservedTable(table)
      return
    }
    if (table.status === TableStatus.AVAILABLE) {
      addTable(table)
      return
    }
  }

  const confirmAddReservedTable = (table: ITable) => {
    setSelectedTableId(table.slug)
    addTable(table)
    setReservedTable(null)
  }

  return (
    <div className="mt-6 flex w-full flex-col rounded-md border">
      <div className="flex flex-col items-start justify-between gap-2 bg-muted/60 p-4 sm:flex-row">
        <span className="text-md font-medium">{t('table.title')}</span>
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
      <div className="flex h-full w-full flex-row flex-wrap gap-4 p-4">
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
      {openOrderTypeAlert && (
        <OrderTypeAlertDialog
          open={openOrderTypeAlert}
          onCancel={() => setOpenOrderTypeAlert(false)}
        />
      )}
    </div>
  )
}
