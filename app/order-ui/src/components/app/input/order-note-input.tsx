import { useTranslation } from 'react-i18next'
import { ChangeEvent } from 'react'

import { Textarea } from '@/components/ui'
import { useOrderFlowStore } from '@/stores'
import { ICartItem } from '@/types'

interface OrderNoteInputProps {
  order: ICartItem | null
}

export default function OrderNoteInput({ order }: OrderNoteInputProps) {
  const { t } = useTranslation('menu')
  const { addOrderNote } = useOrderFlowStore()

  const handleNoteChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const note = e.target.value
    addOrderNote(note)
  }

  return (
    <div className="flex w-full flex-row items-center justify-center gap-2.5">
      <div className="flex flex-row flex-1 gap-2 justify-between items-start w-full">
        <Textarea
          defaultValue={order?.note || ''}
          className='bg-white text-[11px] shadow-none xl:text-sm dark:border-muted-foreground/60 dark:bg-transparent'
          placeholder={t('order.enterOrderNote')}
          onChange={handleNoteChange}
        />
      </div>
    </div>
  )
}
