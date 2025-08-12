import { NotepadText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ChangeEvent } from 'react'

import { Input } from '@/components/ui'
import { useOrderFlowStore } from '@/stores'
import { IOrderItem } from '@/types'

interface CartNoteInputProps {
  cartItem: IOrderItem
}

export default function CartNoteInput({ cartItem }: CartNoteInputProps) {
  const { t } = useTranslation('menu')
  const { addNote } = useOrderFlowStore()

  const handleNoteChange = (e: ChangeEvent<HTMLInputElement>) => {
    const note = e.target.value
    addNote(cartItem.id, note)
  }

  return (
    <div className="flex w-full flex-row items-center justify-center gap-2.5">
      <div className="flex flex-row flex-1 gap-2 justify-between items-center w-full">
        <NotepadText className="text-muted-foreground" size={16} />
        <Input
          defaultValue={cartItem?.note || ''}
          type="text"
          className="h-7 text-[11px] xl:text-sm shadow-none dark:border-muted-foreground/60"
          placeholder={t('order.enterNote')}
          onChange={handleNoteChange}
        />
      </div>
    </div>
  )
}
