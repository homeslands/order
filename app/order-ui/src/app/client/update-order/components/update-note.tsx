import { NotepadText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useState } from 'react'

import { Button, Input } from '@/components/ui'
import { IOrderItem } from '@/types'
import { useOrderFlowStore } from '@/stores'

interface OrderItemNoteInputProps {
    orderItem: IOrderItem
}

export default function UpdateOrderItemNoteInput({ orderItem }: OrderItemNoteInputProps) {
    const { t } = useTranslation('menu')
    const [note, setNote] = useState(orderItem.note || '')
    const { addOrderNote } = useOrderFlowStore()

    const handleUpdateOrderItemNote = useCallback(() => {
        addOrderNote(note)
    }, [note, addOrderNote])

    // Set initial input value on mount or when note changes
    useEffect(() => {
        setNote(orderItem.note || '')
    }, [orderItem.note, setNote])
    return (
        <div className="flex w-full flex-row items-center justify-center gap-2.5">
            <div className="flex flex-row flex-1 gap-2 justify-between items-center w-full">
                <NotepadText className="text-muted-foreground" />
                <Input
                    defaultValue={orderItem?.note || ''}
                    type="text"
                    className='text-xs shadow-none sm:text-sm'
                    placeholder={t('order.enterNote')}
                    onChange={(e) => setNote(e.target.value)}
                />
                <Button
                    size="sm"
                    className='h-9'
                    onClick={handleUpdateOrderItemNote}
                >
                    {t('order.updateNote')}
                </Button>
            </div>
        </div>
    )
}
