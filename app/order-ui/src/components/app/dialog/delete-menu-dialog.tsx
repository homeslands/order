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

import { IMenu } from '@/types'

import { useDeleteMenu } from '@/hooks'
import { showToast } from '@/utils'
import moment from 'moment'

export default function DeleteMenuDialog({
  menu,
}: {
  menu: IMenu
}) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['menu'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { mutate: deleteMenu } = useDeleteMenu()
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (menuSlug: string) => {
    deleteMenu(menuSlug, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['menus'],
        })
        setIsOpen(false)
        showToast(tToast('toast.deleteMenuSuccess'))
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="flex justify-start w-full" asChild>
        <DialogTrigger asChild>
          <Button
            variant='ghost'
            className="gap-1 px-2 text-sm bg-destructive/10 hover:bg-destructive/15 hover:text-destructive text-destructive"
            onClick={() => setIsOpen(true)}
          >
            <Trash2 className="icon" />
            <span>
              {t('menu.delete')}
            </span>
          </Button>
        </DialogTrigger>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b border-destructive text-destructive">
            <div className="flex gap-2 items-center">
              <TriangleAlert className="w-6 h-6" />
              {t('menu.delete')}
            </div>
          </DialogTitle>
          <DialogDescription className={`p-2 bg-red-100 rounded-md dark:bg-transparent text-destructive`}>
            {tCommon('common.deleteNote')}
          </DialogDescription>

          <div className="py-4 text-sm text-muted-foreground">
            {t('menu.deleteMenuWarning1')}{' '}
            <span className="font-bold">{moment(menu?.createdAt).format('DD/MM/YYYY')}</span>
            <br />
            {t('menu.deleteMenuConfirmation')}
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row gap-2 justify-center">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {tCommon('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => menu && handleSubmit(menu.slug || '')}
          >
            {tCommon('common.confirmDelete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
