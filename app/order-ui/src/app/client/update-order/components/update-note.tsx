import { NotepadText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCallback, useEffect } from 'react'

import { Input } from '@/components/ui'
import { IOrderDetail } from '@/types'
import { useDebouncedInput, useUpdateNoteOrderItem } from '@/hooks'
import { useQueryClient } from '@tanstack/react-query'

interface OrderNoteInputProps {
    orderItem: IOrderDetail
}

export default function UpdateOrderNoteInput({ orderItem }: OrderNoteInputProps) {
    const { t } = useTranslation('menu')
    const { setInputValue, debouncedInputValue } = useDebouncedInput()
    const { mutate: updateNote } = useUpdateNoteOrderItem()
    const queryClient = useQueryClient();
    const handleUpdateNote = useCallback(() => {
        updateNote(
            { slug: orderItem.slug, data: { note: debouncedInputValue } },
            { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }) }
        )
    }, [debouncedInputValue, orderItem.slug, updateNote, queryClient])

    useEffect(() => {
        handleUpdateNote()
    }, [handleUpdateNote])
    return (
        <div className="flex w-full flex-row items-center justify-center gap-2.5">
            <div className="flex flex-row items-center justify-between flex-1 w-full gap-2">
                <NotepadText className="text-muted-foreground" />
                <Input
                    defaultValue={orderItem?.note || ''}
                    type="text"
                    className='shadow-none'
                    placeholder={t('order.enterNote')}
                    onChange={(e) => setInputValue(e.target.value)}
                />
            </div>
        </div>
    )
}
