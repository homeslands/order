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

import { UpdateStaticPageForm } from '@/components/app/form'

interface UpdateStaticPageDialogProps {
  staticPageData: {
    slug: string;
    key: string;
    title: string;
    content: string;
  } | null;
  onCompleted?: () => void;
}

export default function UpdateStaticPageDialog({ onCompleted, staticPageData }: UpdateStaticPageDialogProps) {
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
          disabled={!staticPageData} // Add disabled state when no data
        >
          {t('staticPage.update')}
        </Button>
      </DialogTrigger>
      {staticPageData && (
        <DialogContent className="max-w-[20rem] rounded-md px-4 sm:max-w-[36rem]">
          <DialogHeader>
            <DialogTitle>{t('staticPage.update')}</DialogTitle>
            <DialogDescription>
              {t('staticPage.updateDescription')}
            </DialogDescription>
          </DialogHeader>
          <UpdateStaticPageForm staticPageData={staticPageData} onSubmit={handleSubmit} onCompleted={onCompleted} />
        </DialogContent>
      )}
    </Dialog>
  )
}

