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
import { useBranchStore, useOrderTypeStore, useUserStore } from "@/stores"
import { OrderTypeEnum, ITable } from "@/types"
import { TableStatus } from "@/constants"
import { SelectReservedTableDialog } from "../dialog"

interface IClientTableSelectInUpdateOrderProps {
    tableOrder?: ITable | null
    orderType: OrderTypeEnum
    onTableSelect?: (table: ITable) => void
}

export default function ClientTableSelectInUpdateOrder({ tableOrder, orderType, onTableSelect }: IClientTableSelectInUpdateOrderProps) {
    const { t } = useTranslation('table')
    const { addTable } = useOrderTypeStore()
    const { userInfo } = useUserStore()
    const { branch } = useBranchStore()
    const { data: tables } = useTables(branch?.slug || userInfo?.branch?.slug || '')

    const [selectedTable, setSelectedTable] = useState<ITable | null>(null)
    const [selectedTableId, setSelectedTableId] = useState<string | undefined>()
    const [isUserAction, setIsUserAction] = useState(false)
    const [isUpdatingFromProps, setIsUpdatingFromProps] = useState(false)

    useEffect(() => {
        // Chỉ set selectedTableId từ props, KHÔNG set selectedTable 
        // để tránh trigger dialog khi tableOrder thay đổi từ update order
        const addedTable = tableOrder?.slug
        setIsUpdatingFromProps(true)
        setSelectedTableId(addedTable)

        // Reset flag sau một tick để tránh ảnh hưởng đến user actions
        setTimeout(() => setIsUpdatingFromProps(false), 0)
    }, [tableOrder])

    if (orderType === OrderTypeEnum.TAKE_OUT) {
        return null
    }

    const handleTableSelect = (tableId: string) => {
        // Bỏ qua nếu đang update từ props để tránh trigger dialog không mong muốn
        if (isUpdatingFromProps) return

        const table = tables?.result?.find((t) => t.slug === tableId)
        if (!table) return

        setIsUserAction(true) // Mark as user action

        if (table.status === TableStatus.RESERVED) {
            setSelectedTable(table)
        } else {
            addTable(table.slug)
            setSelectedTableId(tableId)
            onTableSelect?.(table)
            setIsUserAction(false) // Reset after handling
        }
    }

    const handleConfirmTable = (table: ITable) => {
        addTable(table.slug)
        onTableSelect?.(table)
        setSelectedTableId(table.slug)
        setSelectedTable(null) // Đóng dialog
        setIsUserAction(false) // Reset after handling
    }

    return (
        <>
            <Select onValueChange={handleTableSelect} value={selectedTableId} >
                <SelectTrigger className={`w-full ${!selectedTableId ? 'highlight-blink-border' : 'border-primary'}`}>
                    <SelectValue placeholder={t('table.title')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>{t('table.title')}</SelectLabel>
                        {tables?.result?.map((table) => (
                            <SelectItem key={table.slug} value={table.slug} className={table.status === TableStatus.RESERVED ? 'text-red-400' : ''}>
                                {`${table.name} - ${t(`table.${table.status}`)}`}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>

            {/* Dialog hiển thị khi chọn bàn đã đặt - chỉ khi là user action */}
            {selectedTable && selectedTable.slug !== tableOrder?.slug && isUserAction && (
                <SelectReservedTableDialog
                    table={selectedTable}
                    onConfirm={handleConfirmTable}
                    onCancel={() => {
                        setSelectedTable(null)
                        setIsUserAction(false)
                    }}
                />
            )}
        </>
    )
}
