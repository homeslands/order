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

import { IProductVariant } from '@/types'

import { useDeleteProductVariant } from '@/hooks'
import { showToast } from '@/utils'
import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

export default function DeleteProductVariantDialog({
  productVariant,
}: {
  productVariant: IProductVariant
}) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['product'])
  const { t: tCommon } = useTranslation('common')
  const { slug } = useParams()
  const { t: tToast } = useTranslation('toast')
  const { mutate: deleteProductVariant } = useDeleteProductVariant()
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (productVariantSlug: string) => {
    deleteProductVariant(productVariantSlug, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['product', slug],
        })
        setIsOpen(false)
        showToast(tToast('toast.deleteProductVariantSuccess'))
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="flex w-full justify-start" asChild>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="gap-1 px-2 text-sm"
            onClick={() => setIsOpen(true)}
          >
            <Trash2 className="icon" />
            {t('productVariant.delete')}
          </Button>
        </DialogTrigger>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="border-b border-destructive pb-4 text-destructive">
            <div className="flex items-center gap-2">
              <TriangleAlert className="h-6 w-6" />
              {t('productVariant.delete')}
            </div>
          </DialogTitle>
          <DialogDescription className="rounded-md bg-red-100 p-2 text-destructive">
            {tCommon('common.deleteNote')}
          </DialogDescription>

          <div className="py-4 text-sm text-muted-foreground">
            {t('productVariant.deleteProductVariantWarning1')}{' '}
            <span className="font-bold">{productVariant?.size.name}</span>
            {t('productVariant.deleteProductVariantWarning2')} <br />
            {t('productVariant.deleteProductVariantConfirmation')}
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-center gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {tCommon('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              productVariant && handleSubmit(productVariant.slug || '')
            }
          >
            {tCommon('common.confirmDelete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
