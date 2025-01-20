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

import { CreateStaticPageForm } from '@/components/app/form'

// interface CreateStaticPageDialogProps {
//   content: string
// }

export default function CreateStaticPageDialog() {
  const { t } = useTranslation(['staticPage'])
  const [isOpen, setIsOpen] = useState(false)
  const handleSubmit = (isOpen: boolean) => {
    setIsOpen(isOpen)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="h-10 gap-1 text-sm"
          onClick={() => setIsOpen(true)}
        >
          {/* <PlusCircledIcon className="icon" /> */}
          {t('staticPage.create')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[20rem] rounded-md px-6 sm:max-w-[36rem]">
        <DialogHeader>
          <DialogTitle>{t('staticPage.create')}</DialogTitle>
          <DialogDescription>
            {t('staticPage.createDescription')}
          </DialogDescription>
        </DialogHeader>
        <CreateStaticPageForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  )
}

