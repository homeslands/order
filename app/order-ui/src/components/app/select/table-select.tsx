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

export default function TableSelect() {
    const { t } = useTranslation('table')
    const { cartItems, addTable } = useCartItemStore()
    const { getUserInfo } = useUserStore()
    const { data: tables } = useTables(getUserInfo()?.branch.slug)

    const [selectedTable, setSelectedTable] = useState<ITable | null>(null)
    const [selectedTableId, setSelectedTableId] = useState<string | undefined>()

    useEffect(() => {
        const addedTable = cartItems?.table
        setSelectedTableId(addedTable)
    }, [cartItems?.table])

    const tableList = tables?.result || []

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
        }
    }

    const handleConfirmTable = (table: ITable) => {
        addTable(table)
        setSelectedTable(null) // Đóng dialog
    }

    return (
        <>
            <Select onValueChange={handleTableSelect} value={selectedTableId}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('table.title')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>{t('table.title')}</SelectLabel>
                        {tableList.map((table) => (
                            <SelectItem key={table.slug} value={table.slug}>
                                {`${table.name} - ${t(`table.${table.status}`)}`}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>

            {/* Dialog hiển thị khi chọn bàn đã đặt */}
            {selectedTable && (
                <SelectReservedTableDialog
                    table={selectedTable}
                    setSelectedTableId={setSelectedTableId}
                    onConfirm={handleConfirmTable}
                    onCancel={() => setSelectedTable(null)}
                />
            )}
        </>
    )
}
