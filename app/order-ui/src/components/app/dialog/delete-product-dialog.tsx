import { useState } from 'react'
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

import { useDeleteProduct } from '@/hooks'
import { showToast } from '@/utils'
import { useQueryClient } from '@tanstack/react-query'

export default function DeleteProductDialog({
  product,
}: {
  product: IProduct
}) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['product'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { mutate: deleteProduct } = useDeleteProduct()
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (catalogSlug: string) => {
    deleteProduct(catalogSlug, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['products'],
        })
        setIsOpen(false)
        showToast(tToast('toast.deleteProductSuccess'))
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="flex justify-start w-full" asChild>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="gap-1 px-2 text-sm"
            onClick={() => setIsOpen(true)}
          >
            <Trash2 className="icon" />
            {t('product.delete')}
          </Button>
        </DialogTrigger>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b border-destructive text-destructive">
            <div className="flex items-center gap-2">
              <TriangleAlert className="w-6 h-6" />
              {t('product.delete')}
            </div>
          </DialogTitle>
          <DialogDescription className={`rounded-md bg-red-100 dark:bg-transparent p-2 text-destructive`}>
            {tCommon('common.deleteNote')}
          </DialogDescription>

          <div className="py-4 text-sm text-gray-500">
            {t('product.deleteProductWarning1')}{' '}
            <span className="font-bold">{product?.name}</span> <br />
            <br />
            {t('product.deleteProductConfirmation')}
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-center gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {tCommon('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => product && handleSubmit(product.slug || '')}
          >
            {tCommon('common.confirmDelete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
