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
  DialogTrigger,
  DialogFooter,
} from '@/components/ui'

import { useUploadBannerImage } from '@/hooks'
import { IBanner } from '@/types'
import { showToast } from '@/utils'

interface IUploadBannerImageDialogProps {
  banner: IBanner
}

export default function UploadBannerImageDialog({ banner }: IUploadBannerImageDialogProps) {
  const { t } = useTranslation(['banner'])
  const { t: tCommon } = useTranslation(['common'])
  const { t: tToast } = useTranslation(['toast'])
  const [isOpen, setIsOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { mutate: uploadBannerImage } = useUploadBannerImage()

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleConfirmUpload = () => {
    if (selectedFile) {
      uploadBannerImage(
        { slug: banner.slug, file: selectedFile },
        {
          onSuccess: () => {
            showToast(tToast('toast.uploadImageSuccess'))
            setIsOpen(false)
            setPreviewImage(null)
            setSelectedFile(null)
          },
        }
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild className="flex justify-start w-full">
        <Button variant="ghost" className="gap-1 px-2 text-sm" onClick={() => setIsOpen(true)}>
          <Upload className="icon" />
          {t('banner.uploadImage')}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-md max-w-[20rem] sm:max-w-[36rem]">
        <DialogHeader>
          <DialogTitle>{t('banner.uploadImage')}</DialogTitle>
          <DialogDescription>{t('banner.uploadImageDescription')}</DialogDescription>
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
                <span>{t('banner.addImage')}</span>
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
                handleFileSelect(file)
              }
            }}
            className="hidden"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {tCommon('common.cancel')}
          </Button>
          <Button
            onClick={handleConfirmUpload}
            disabled={!selectedFile}
          >
            {tCommon('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
