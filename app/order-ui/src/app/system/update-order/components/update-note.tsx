import { NotepadText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useState } from 'react'

import { Button, Input } from '@/components/ui'
import { IOrderDetail } from '@/types'
import { useUpdateNoteOrderItem } from '@/hooks'
import { useQueryClient } from '@tanstack/react-query'
import { showToast } from '@/utils'

interface OrderItemNoteInputProps {
    orderItem: IOrderDetail
}

export default function UpdateOrderItemNoteInput({ orderItem }: OrderItemNoteInputProps) {
    const { t } = useTranslation('menu')
    const { t: tToast } = useTranslation('toast')
    // const { setInputValue, debouncedInputValue } = useDebouncedInput()
    const [note, setNote] = useState(orderItem.note || '')
    const { mutate: updateNote } = useUpdateNoteOrderItem()
    const queryClient = useQueryClient()

    const handleUpdateOrderItemNote = useCallback(() => {
        updateNote({ slug: orderItem.slug, data: { note: note } }, {
            onSuccess: () => {
                showToast(tToast('toast.updateOrderItemNoteSuccess'))
                queryClient.invalidateQueries({ queryKey: ['orders'] })
            }
        })
    }, [orderItem, note, updateNote, queryClient, tToast])

    // Set initial input value on mount or when note changes
    useEffect(() => {
        setNote(orderItem.note || '')
    }, [orderItem.note, setNote])

    // const handleUpdateNote = useCallback(() => {
    //     if (debouncedInputValue !== orderItem.note) {
    //         updateNote(
    //             { slug: orderItem.slug, data: { note: debouncedInputValue } },
    //             {
    //                 onSuccess: () => {
    //                     showToast(tToast('toast.updateOrderItemNoteSuccess'))
    //                     queryClient.invalidateQueries({ queryKey: ['orders'] })
    //                 }
    //             }
    //         )
    //     }
    // }, [debouncedInputValue, orderItem, updateNote, queryClient, tToast])

    // useEffect(() => {
    //     handleUpdateNote()
    // }, [debouncedInputValue, handleUpdateNote])

    return (
        <div className="flex w-full flex-row items-center justify-center gap-2.5">
            <div className="flex flex-row flex-1 gap-2 justify-between items-center w-full">
                <NotepadText className="text-muted-foreground" />
                <Input
                    defaultValue={orderItem.note || ''}
                    value={note}
                    type="text"
                    className="shadow-none"
                    placeholder={t('order.enterNote')}
                    onChange={(e) => setNote(e.target.value)}
                />
                <Button
                    size="sm"
                    onClick={handleUpdateOrderItemNote}
                >
                    {t('order.updateNote')}
                </Button>
            </div>
        </div>
    )
}
