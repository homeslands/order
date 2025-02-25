import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui'

import { CreateBannerForm } from '@/components/app/form'
import { PlusCircledIcon } from '@radix-ui/react-icons'

export default function CreateBannerDialog() {
  const { t } = useTranslation(['banner'])
  const [isOpen, setIsOpen] = useState(false)
  const handleSubmit = (isOpen: boolean) => {
    setIsOpen(isOpen)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1 text-xs" onClick={() => setIsOpen(true)}>
          <PlusCircledIcon className="h-[1.1rem] w-[1.1rem]" />
          {t('banner.create')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[20rem] rounded-md px-6 sm:max-w-[36rem]">
        <DialogHeader>
          <DialogTitle>{t('banner.create')}</DialogTitle>
          <DialogDescription>
            {t('banner.createDescription')}
          </DialogDescription>
        </DialogHeader>
        <CreateBannerForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  )
}
