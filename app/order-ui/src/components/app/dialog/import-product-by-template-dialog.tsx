import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { FileUp, FileX, Upload } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui'

import { useImportMultipleProducts } from '@/hooks'
import { showToast } from '@/utils'
import { useQueryClient } from '@tanstack/react-query'

export default function ImportProductByTemplateDialog() {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['product'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { mutate: importMultipleProducts } = useImportMultipleProducts()
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0]
    if (uploadedFile?.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      uploadedFile?.type === 'application/vnd.ms-excel') {
      setFile(uploadedFile)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1
  })

  const handleSubmit = () => {
    if (!file) return

    importMultipleProducts(file, {
      onSuccess: () => {
        setIsOpen(false)
        setFile(null)
        queryClient.invalidateQueries({
          queryKey: ['products'],
        })
        showToast(tToast('toast.importMultipleProductsSuccess'))
      },
    })
  }

  const clearFile = () => setFile(null)

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) setFile(null)
        setIsOpen(open)
      }}
    >
      <DialogTrigger asChild>
        <Button
          className="flex justify-start w-full gap-1 px-2 text-xs"
        >
          <FileUp className="icon" />
          {t('product.importProducts')}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle>
            {t('product.importProducts')}
          </DialogTitle>
          <DialogDescription>
            {t('product.importProductsDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {!file ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}
              `}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                {isDragActive
                  ? t('product.dropFileHere')
                  : t('product.dragAndDropOrClick')}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {t('product.supportedFormats')}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <FileUp className="w-5 h-5 text-primary" />
                <span className="text-sm truncate max-w-[200px]">{file.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFile}
                className="w-8 h-8"
              >
                <FileX className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {tCommon('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!file}
          >
            {t('product.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
