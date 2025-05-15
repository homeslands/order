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

import { IProduct } from '@/types'
import { useIsMobile, useRemoveChefAreaProduct } from '@/hooks'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'

export default function DeleteProductInChefAreaDialog({ chefAreaProduct, onSuccess }: { chefAreaProduct: IProduct, onSuccess: () => void }) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['chefArea'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const isMobile = useIsMobile()
  const { mutate: removeChefAreaProduct } = useRemoveChefAreaProduct()
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (chefAreaProductSlug: string) => {
    removeChefAreaProduct(chefAreaProductSlug, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.chefAreaProducts],
          exact: false,
          refetchType: 'all'
        })
        setIsOpen(false)
        onSuccess()
        showToast(tToast('toast.removeChefAreaProductSuccess'))
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="flex justify-start w-fit" asChild>
        <DialogTrigger asChild>
          {!isMobile ? (
            <Button
              variant="destructive"
              className="gap-1 px-2 text-sm"
              onClick={() => setIsOpen(true)}
            >
              <Trash2 className="icon" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="gap-1 px-2 text-sm bg-destructive/15"
              onClick={() => setIsOpen(true)}
            >
              <Trash2 className="w-12 h-12 text-destructive" />
            </Button>)}
        </DialogTrigger>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b border-destructive text-destructive">
            <div className="flex gap-2 items-center">
              <TriangleAlert className="w-6 h-6" />
              {t('chefArea.delete')}
            </div>
          </DialogTitle>
          <DialogDescription className={`p-2 bg-red-100 rounded-md dark:bg-transparent text-destructive`}>
            {tCommon('common.deleteNote')}
          </DialogDescription>

          <div className="py-4 text-sm text-muted-foreground">
            {t('chefArea.deleteChefAreaProductWarning1')}{' '}
            <span className="font-bold">{chefAreaProduct?.name}</span>
            {/* {t('chefArea.deleteChefAreaProductWarning2')}{' '}
            <span className="font-bold">{chefAreaProduct.name}</span> <br /> */}
            <br />
            {t('chefArea.deleteChefAreaProductConfirmation')}
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row gap-2 justify-center">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {tCommon('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => chefAreaProduct && handleSubmit(chefAreaProduct.productChefArea || '')}
          >
            {tCommon('common.confirmDelete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
