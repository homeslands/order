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

import { IMenuItem } from '@/types'

import { useDeleteMenuItem } from '@/hooks'
import { showToast } from '@/utils'

export default function DeleteMenuItemDialog({
  menuItem,
}: {
  menuItem: IMenuItem
}) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['menu'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { mutate: deleteMenuItem } = useDeleteMenuItem()
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (menuItemSlug: string) => {
    deleteMenuItem(menuItemSlug, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['specific-menu'],
        })
        setIsOpen(false)
        showToast(tToast('toast.deleteMenuItemSuccess'))
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="flex justify-start w-full" asChild>
        <DialogTrigger asChild>
          <Button
            variant="destructive"
            className="gap-1 text-sm"
            onClick={() => setIsOpen(true)}
          >
            <Trash2 className="icon" />
          </Button>
        </DialogTrigger>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b border-destructive text-destructive">
            <div className="flex items-center gap-2">
              <TriangleAlert className="w-6 h-6" />
              {t('menu.delete')}
            </div>
          </DialogTitle>
          <DialogDescription className={`rounded-md bg-red-100 dark:bg-transparent p-2 text-destructive`}>
            {tCommon('common.deleteNote')}
          </DialogDescription>

          <div className="py-4 text-sm text-muted-foreground">
            {t('menu.deleteMenuItemWarning1')}{' '}
            <span className="font-bold">{menuItem?.product.name}</span>
            {t('menu.deleteMenuItemConfirmation')}
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-center gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {tCommon('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => menuItem && handleSubmit(menuItem.slug || '')}
          >
            {tCommon('common.confirmDelete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
