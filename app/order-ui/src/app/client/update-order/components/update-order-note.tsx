import { NotepadText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCallback, useState } from 'react'

import { Input } from '@/components/ui'
import { IOrder, IUpdateOrderTypeRequest } from '@/types'
import { useUpdateOrderType } from '@/hooks'
import { Button } from '@/components/ui'
import { showToast } from '@/utils'

interface OrderNoteInputProps {
    onSuccess: () => void
    order: IOrder | undefined
}

export default function UpdateOrderNoteInput({ order, onSuccess }: OrderNoteInputProps) {
    const { t } = useTranslation('menu')
    const { t: tToast } = useTranslation('toast')
    const [note, setNote] = useState(order?.description || '')
    const { mutate: updateOrderType } = useUpdateOrderType()

    const handleUpdateNote = useCallback(() => {
        const params: IUpdateOrderTypeRequest = {
            type: order?.type || '',
            table: order?.table?.slug || null,
            description: note
        }
        updateOrderType(
            { slug: order?.slug || '', params },
            {
                onSuccess: () => {
                    showToast(tToast('toast.updateOrderNoteSuccess'))
                    onSuccess()
                }
            }
        )
    }, [note, order?.slug, updateOrderType, order?.type, order?.table?.slug, onSuccess, tToast])

    return (
        <div className="flex w-full flex-row items-center justify-center gap-2.5">
            <div className="flex flex-row flex-1 gap-2 justify-between items-center w-full">
                <NotepadText className="text-muted-foreground" />
                <Input
                    value={note}
                    type="text"
                    className='shadow-none'
                    placeholder={t('order.enterOrderNote')}
                    onChange={(e) => setNote(e.target.value)}
                />
                <Button
                    size="sm"
                    className='h-9'
                    onClick={handleUpdateNote}
                >
                    {t('order.updateNote')}
                </Button>
            </div>
        </div>
    )
}
