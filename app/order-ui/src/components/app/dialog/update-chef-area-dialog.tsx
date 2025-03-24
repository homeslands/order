import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SquarePen } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui'

import { UpdateChefAreaForm } from '@/components/app/form'
import { IChefArea } from '@/types'

interface DialogUpdateChefAreaProps {
  chefArea: IChefArea
}

export default function UpdateChefAreaDialog({
  chefArea,
}: DialogUpdateChefAreaProps) {
  const { t } = useTranslation(['chefArea'])
  const [isOpen, setIsOpen] = useState(false)
  const handleSubmit = (isOpen: boolean) => {
    setIsOpen(isOpen)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild className="flex justify-start w-fit">
        <Button
          variant="ghost"
          className="flex justify-start gap-1 px-0 text-sm"
          onClick={() => setIsOpen(true)}
        >
          <SquarePen className="icon" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[20rem] rounded-md px-6 sm:max-w-[36rem]">
        <DialogHeader>
          <DialogTitle>{t('chefArea.update')}</DialogTitle>
          <DialogDescription>
            {t('chefArea.updateDescription')}
          </DialogDescription>
        </DialogHeader>
        <UpdateChefAreaForm chefArea={chefArea} onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  )
}
