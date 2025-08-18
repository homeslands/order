import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Trash2, TriangleAlert } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui'

import { IStaticPage } from '@/types'

import { useDeleteStaticPage } from '@/hooks'
import { showToast } from '@/utils'

export default function DeleteStaticPageDialog({
  staticPage,
}: {
  staticPage: IStaticPage
}) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['staticPage'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { mutate: deleteStaticPage } = useDeleteStaticPage()
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (staticPageSlug: string) => {
    deleteStaticPage(staticPageSlug, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['staticPages'],
        })
        setIsOpen(false)
        showToast(tToast('toast.deleteStaticPageSuccess'))
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="flex justify-start w-full" asChild>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="gap-1 px-2 text-sm bg-destructive/15 text-destructive hover:bg-destructive/30 hover:text-destructive"
            onClick={() => setIsOpen(true)}
          >
            <Trash2 className="icon" />
            {t('staticPage.delete')}
          </Button>
        </DialogTrigger>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b border-destructive text-destructive">
            <div className="flex items-center gap-2">
              <TriangleAlert className="w-6 h-6" />
              {t('staticPage.delete')}
            </div>
          </DialogTitle>
          <DialogDescription className={`rounded-md bg-red-100 dark:bg-transparent p-2 text-destructive`}>
            {tCommon('common.deleteNote')}
          </DialogDescription>

          <div className="py-4 text-sm text-muted-foreground">
            {t('staticPage.deleteStaticPageWarning')}{' '}
            <span className="font-bold">{staticPage?.title}</span> <br />
            <br />
            {t('staticPage.deleteStaticPageConfirmation')}
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-center gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {tCommon('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => staticPage && handleSubmit(staticPage.slug || '')}
          >
            {tCommon('common.confirmDelete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
