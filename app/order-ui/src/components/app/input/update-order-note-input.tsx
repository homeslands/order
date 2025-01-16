import { NotepadText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ChangeEvent } from 'react'

import { Input } from '@/components/ui'
import { useUpdateOrderStore } from '@/stores'
import { IOrderItem } from '@/types'

interface CartNoteInputProps {
  cartItem: IOrderItem
}

export default function UpdateOrderNoteInput({ cartItem }: CartNoteInputProps) {
  const { t } = useTranslation('menu')
  const { addNote } = useUpdateOrderStore()

  const handleNoteChange = (e: ChangeEvent<HTMLInputElement>) => {
    const note = e.target.value
    addNote(cartItem.id, note)
  }

  return (
    <div className="flex w-full flex-row items-center justify-center gap-2.5">
      <div className="flex flex-row items-center justify-between flex-1 w-full gap-2">
        <NotepadText className="text-muted-foreground" />
        <Input
          defaultValue={cartItem?.note || ''}
          type="text"
          className='shadow-none'
          placeholder={t('order.enterNote')}
          onChange={handleNoteChange}
        />
      </div>
    </div>
  )
}
