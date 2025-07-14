import { NotepadText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ChangeEvent } from 'react'

import { Input } from '@/components/ui'
import { useOrderFlowStore } from '@/stores'
import { IOrderItem } from '@/types'

interface OrderItemNoteInUpdateOrderInputProps {
  orderItem: IOrderItem
}

export default function OrderItemNoteInUpdateOrderInput({ orderItem }: OrderItemNoteInUpdateOrderInputProps) {
  const { t } = useTranslation('menu')
  const { addDraftNote } = useOrderFlowStore()

  const handleNoteChange = (e: ChangeEvent<HTMLInputElement>) => {
    const note = e.target.value
    addDraftNote(orderItem.id, note)
  }

  return (
    <div className="flex w-full flex-row items-center justify-center gap-2.5">
      <div className="flex flex-row flex-1 gap-2 justify-between items-center w-full">
        <NotepadText className="text-muted-foreground" size={16} />
        <Input
          defaultValue={orderItem?.note || ''}
          type="text"
          className="h-7 text-[11px] xl:text-sm shadow-none"
          placeholder={t('order.enterNote')}
          onChange={handleNoteChange}
        />
      </div>
    </div>
  )
}
