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
import { QUERYKEY } from '@/constants'

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
            queryKey: [QUERYKEY.specificProduct, slug],
          })
          setIsOpen(false)
          showToast(tToast('toast.deleteProductImageSuccess'))
        },
      },
    )
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
            <div className="flex gap-2 items-center">
              <TriangleAlert className="w-6 h-6" />
              {t('product.deleteImage')}
            </div>
          </DialogTitle>
          <DialogDescription className={`p-2 bg-red-100 rounded-md dark:bg-transparent text-destructive`}>
            {tCommon('common.deleteNote')}
          </DialogDescription>

          <div className="py-4 text-sm text-gray-500">
            {t('product.deleteProductImageConfirmation')}
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row gap-2 justify-center">
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
