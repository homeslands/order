import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EditIcon, PenSquareIcon } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'

import { Tooltip } from 'react-tooltip'
import { ICoinPolicy } from '@/types/coin-policy.type'
import { UpdateCoinPolicyForm } from '../form/update-coin-policy-form'

interface UpdateCoinPolicyDialogProps {
  data: ICoinPolicy | null
}

export default function UpdateCoinPolicyDialog({ data }: UpdateCoinPolicyDialogProps) {
  const { t } = useTranslation(['giftCard'])
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <>
          <EditIcon
            data-tooltip-id="tooltip"
            data-tooltip-content={t('giftCard.coinPolicy.tooltip.update')}
            strokeWidth={2} className="text-yellow-500 cursor-pointer" />
          <Tooltip id="tooltip" variant="light" style={{ width: 'fit-content', backgroundColor: 'white' }} place="top" />
        </>
      </DialogTrigger>
      <DialogContent className="max-w-[20rem] rounded-md px-6 sm:max-w-[36rem]">
        <DialogHeader>
          <DialogTitle>{t('giftCard.coinPolicy.title')}</DialogTitle>
        </DialogHeader>
        <UpdateCoinPolicyForm data={data} onSubmit={setIsOpen} />
      </DialogContent>
    </Dialog>
  )
}
