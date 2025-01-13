import { useState } from 'react'
import { useParams } from 'react-router-dom'
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

import { useDeleteProductImage } from '@/hooks'
import { showToast } from '@/utils'

export default function DeleteProductImageDialog({ image }: { image: string }) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['product'])
  const { slug } = useParams()
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { mutate: deleteProductImage } = useDeleteProductImage()
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (slug: string, image: string) => {
    deleteProductImage(
      { slug, image },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ['product', slug],
          })
          setIsOpen(false)
          showToast(tToast('toast.deleteProductImageSuccess'))
        },
      },
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="flex w-full justify-start" asChild>
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
          <DialogTitle className="border-b border-destructive pb-4 text-destructive">
            <div className="flex items-center gap-2">
              <TriangleAlert className="h-6 w-6" />
              {t('product.deleteImage')}
            </div>
          </DialogTitle>
          <DialogDescription className="rounded-md bg-red-100 p-2 text-destructive">
            {tCommon('common.deleteNote')}
          </DialogDescription>

          <div className="py-4 text-sm text-gray-500">
            {t('product.deleteProductImageConfirmation')}
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-center gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {tCommon('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => slug && handleSubmit(slug, image)}
          >
            {tCommon('common.confirmDelete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
