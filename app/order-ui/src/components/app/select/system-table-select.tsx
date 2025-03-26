import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui"
import { useTables } from "@/hooks"
import { useCartItemStore, useUserStore } from "@/stores"
import { OrderTypeEnum, ITable } from "@/types"
import { TableStatus } from "@/constants"
import { SelectReservedTableDialog } from "../dialog"

interface ITableSelectProps {
    tableOrder?: ITable | null
    onTableSelect?: (table: ITable) => void
}

export default function SystemTableSelect({ tableOrder, onTableSelect }: ITableSelectProps) {
    const { t } = useTranslation('table')
    const { cartItems, addTable } = useCartItemStore()
    const { userInfo } = useUserStore()
    const { data: tables } = useTables(userInfo?.branch?.slug || '')

    const [selectedTable, setSelectedTable] = useState<ITable | null>(null)
    const [selectedTableId, setSelectedTableId] = useState<string | undefined>()

    useEffect(() => {
        const addedTable = cartItems?.table
        setSelectedTableId(addedTable)
    }, [cartItems?.table])
    useEffect(() => {
        if (tableOrder) {
            setSelectedTable(tableOrder)
            setSelectedTableId(tableOrder.slug)
        }
    }, [tableOrder])
    const tableList = tables?.result.sort((a, b) => {
        if (a.status !== b.status) {
            return a.status.localeCompare(b.status); // Đảo ngược status (RESERVED trước AVAILABLE)
        }
        return Number(a.name) - Number(b.name); // Sắp xếp theo tên nếu status giống nhau
    }) || [];

    if (cartItems?.type === OrderTypeEnum.TAKE_OUT) {
        return null
    }

    const handleTableSelect = (tableId: string) => {
        const table = tableList.find((t) => t.slug === tableId)
        if (!table) return
        if (table.status === TableStatus.RESERVED) {
            setSelectedTable(table)
        } else {
            addTable(table)
            setSelectedTableId(tableId)
            onTableSelect?.(table)
        }
    }

    const handleConfirmTable = (table: ITable) => {
        addTable(table)
        onTableSelect?.(table)
        setSelectedTableId(table.slug)
        setSelectedTable(null) // Đóng dialog
    }

    return (
        <>
            <Select onValueChange={handleTableSelect} value={selectedTableId} >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('table.title')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>{t('table.title')}</SelectLabel>
                        {tableList.map((table) => (
                            <SelectItem key={table.slug} value={table.slug} className={table.status === TableStatus.RESERVED ? 'text-red-400' : ''}>
                                {`${table.name} - ${t(`table.${table.status}`)}`}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>

            {/* Dialog hiển thị khi chọn bàn đã đặt */}
            {selectedTable && selectedTable.slug !== tableOrder?.slug && (
                <SelectReservedTableDialog
                    table={selectedTable}
                    onConfirm={handleConfirmTable}
                    onCancel={() => setSelectedTable(null)}
                />
            )}
        </>
    )
}
