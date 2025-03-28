import { NotepadText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ChangeEvent } from 'react'

import { Input } from '@/components/ui'
import { useUpdateOrderStore } from '@/stores'
import { IOrderDetail } from '@/types'

interface CartNoteInputProps {
  orderItem: IOrderDetail
}

export default function UpdateOrderNoteInput({ orderItem }: CartNoteInputProps) {
  const { t } = useTranslation('menu')
  const { addNote } = useUpdateOrderStore()

  const handleNoteChange = (e: ChangeEvent<HTMLInputElement>) => {
    const note = e.target.value
    addNote(orderItem.id!, note)
  }

  return (
    <div className="flex w-full flex-row items-center justify-center gap-2.5">
      <div className="flex flex-row flex-1 gap-2 justify-between items-center w-full">
        <NotepadText className="text-muted-foreground" />
        <Input
          defaultValue={orderItem?.note || ''}
          type="text"
          className='shadow-none'
          placeholder={t('order.enterNote')}
          onChange={handleNoteChange}
        />
      </div>
    </div>
  )
}
