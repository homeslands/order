import { useTranslation } from 'react-i18next'
import { ChangeEvent } from 'react'

import { Textarea } from '@/components/ui'
import { useCartItemStore } from '@/stores'
import { ICartItem } from '@/types'

interface OrderNoteInputProps {
  order: ICartItem | null
}

export default function OrderNoteInput({ order }: OrderNoteInputProps) {
  const { t } = useTranslation('menu')
  const { addOrderNote } = useCartItemStore()

  const handleNoteChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const note = e.target.value
    addOrderNote(note)
  }

  return (
    <div className="flex w-full flex-row items-center justify-center gap-2.5">
      <div className="flex flex-row flex-1 gap-2 justify-between items-start w-full">
        {/* <span className="w-20 text-foreground text-bold">
          {t('order.note')}
        </span> */}
        <Textarea
          defaultValue={order?.note || ''}
          className='shadow-none'
          placeholder={t('order.enterOrderNote')}
          onChange={handleNoteChange}
        />
      </div>
    </div>
  )
}
