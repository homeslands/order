import { useTranslation } from 'react-i18next'
import { ChangeEvent } from 'react'

import { Textarea } from '@/components/ui'
import { useOrderFlowStore } from '@/stores'
import { IOrderToUpdate } from '@/types'

interface OrderNoteInUpdateOrderInputProps {
  order?: IOrderToUpdate
}

export default function OrderNoteInUpdateOrderInput({ order }: OrderNoteInUpdateOrderInputProps) {
  const { t } = useTranslation('menu')
  const { setDraftDescription } = useOrderFlowStore()

  const handleNoteChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const note = e.target.value
    setDraftDescription(note)
  }

  return (
    <div className="flex w-full flex-row items-center justify-center gap-2.5">
      <div className="flex flex-row flex-1 gap-2 justify-between items-start w-full">
        <Textarea
          defaultValue={order?.description || ''}
          className='bg-white text-[11px] shadow-none xl:text-sm dark:bg-transparent'
          placeholder={t('order.enterOrderNote')}
          onChange={handleNoteChange}
        />
      </div>
    </div>
  )
}
