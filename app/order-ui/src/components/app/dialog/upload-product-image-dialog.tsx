import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload } from 'lucide-react'
import { PlusCircledIcon } from '@radix-ui/react-icons'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui'

import { useUploadProductImage } from '@/hooks'
import { IProduct } from '@/types'
import { showToast } from '@/utils'
import { useQueryClient } from '@tanstack/react-query'

interface ICreateProductDialogProps {
  product: IProduct
}

export default function UploadProductImageDialog({ product }: ICreateProductDialogProps) {
  const { t } = useTranslation(['product'])
  const { t: tToast } = useTranslation(['toast'])
  const [isOpen, setIsOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { mutate: uploadProductImage } = useUploadProductImage()

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }
  const queryClient = useQueryClient();
  const uploadImage = (file: File) => {
    uploadProductImage(
      { slug: product.slug, file },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['products'] })
          showToast(tToast('toast.uploadImageSuccess'))
          setIsOpen(false)
          setPreviewImage(null)
        },
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild className="flex justify-start w-full">
        <Button variant="ghost" className="gap-1 px-2 text-sm" onClick={() => setIsOpen(true)}>
          <Upload className="icon" />
          {t('product.uploadImage')}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-md max-w-[20rem] sm:max-w-[36rem]">
        <DialogHeader>
          <DialogTitle>{t('product.uploadImage')}</DialogTitle>
          <DialogDescription>{t('product.uploadImageDescription')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div
            className="flex flex-col items-center justify-center w-full h-40 text-gray-400 transition-colors border rounded-md cursor-pointer hover:border-primary hover:bg-gray-50"
            onClick={triggerFileInput}
          >
            {previewImage ? (
              <img
                src={previewImage}
                alt="Preview"
                className="object-cover w-full h-full rounded-lg"
              />
            ) : (
              <>
                <PlusCircledIcon className="w-12 h-12 mb-2" />
                <span>{t('product.addImage')}</span>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            name="file"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                uploadImage(file)
              }
            }}
            className="hidden"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
