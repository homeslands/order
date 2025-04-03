import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { TriangleAlert } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui'

import { ICreateChefAreaProductRequest } from '@/types'
import { useAddMultipleChefAreaProduct } from '@/hooks'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'

interface IConfirmAddProductInChefAreaDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSuccess: () => void
  onCloseSheet: () => void
  productData: ICreateChefAreaProductRequest | null
  disabled?: boolean
}

export default function ConfirmAddProductInChefAreaDialog({
  isOpen,
  onOpenChange,
  onSuccess,
  onCloseSheet,
  productData,
  disabled,
}: IConfirmAddProductInChefAreaDialogProps) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['chefArea'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { mutate: addChefAreaProduct } = useAddMultipleChefAreaProduct()

  const handleSubmit = (productData: ICreateChefAreaProductRequest) => {
    if (!productData) return
    addChefAreaProduct(productData, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.products]
        })
        onOpenChange(false)
        onCloseSheet()
        onSuccess()
        showToast(tToast('toast.addChefAreaProductSuccess'))
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled}
          className="flex items-center w-full text-sm rounded-full sm:w-[10rem]"
          onClick={() => onOpenChange(true)}
        >
          {t('chefArea.addProduct')}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md px-6 sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b border-primary text-primary">
            <div className="flex gap-2 items-center">
              <TriangleAlert className="w-6 h-6" />
              {t('chefArea.addProduct')}
            </div>
          </DialogTitle>
          <DialogDescription className="p-2 rounded-md bg-primary/10 text-primary">
            {tCommon('common.deleteNote')}
          </DialogDescription>

          <div className="py-4 text-sm text-gray-500">
            {t('chefArea.confirmAdChefAreaProduct')}
            <br />
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row gap-2 justify-center">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border border-gray-300 min-w-24"
          >
            {tCommon('common.cancel')}
          </Button>
          <Button onClick={() => productData && handleSubmit(productData)}>
            {t('chefArea.addProduct')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
