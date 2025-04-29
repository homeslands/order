import { useState } from 'react'
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

import { ChefOrderStatus, IChefOrders, IUpdateChefOrderStatusRequest } from '@/types'
import { useUpdateChefOrderStatus } from '@/hooks'
// import { loadDataToPrinter, showToast } from '@/utils'
import { QUERYKEY } from '@/constants'

interface IConfirmUpdateChefOrderStatusDialogProps {
  onSuccess: (slug: string) => void
  chefOrder: IChefOrders | null
}

export default function ConfirmUpdateChefOrderStatusDialog({
  chefOrder,
  onSuccess,
}: IConfirmUpdateChefOrderStatusDialogProps) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['chefArea'])
  const { t: tCommon } = useTranslation('common')
  const [isOpen, onOpenChange] = useState(false)
  const { mutate: updateChefOrderStatus } = useUpdateChefOrderStatus()
  // const { mutate: exportAutoChefOrderTicket } = useExportAutoChefOrderTicket()

  const handleSubmit = (chefOrder: IChefOrders) => {
    if (!chefOrder) return
    const params: IUpdateChefOrderStatusRequest = {
      slug: chefOrder.slug,
      status: ChefOrderStatus.ACCEPTED,
    }
    updateChefOrderStatus(params, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.chefOrders]
        })
        onSuccess(chefOrder.slug)
        // exportAutoChefOrderTicket(chefOrder.slug, {
        //   onSuccess: (data: Blob) => {
        //     queryClient.invalidateQueries({
        //       queryKey: [QUERYKEY.chefOrders]
        //     })
        //     showToast(tToast('toast.updateChefOrderStatusSuccess'))
        //     loadDataToPrinter(data)
        //   },
        // })
        onOpenChange(false)

      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          className="flex items-center text-sm w-fit"
          onClick={() => onOpenChange(true)}
        >
          {t('chefOrder.reception')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[22rem] rounded-md px-6 sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b border-primary text-primary">
            <div className="flex gap-2 items-center">
              <TriangleAlert className="w-6 h-6" />
              {t('chefOrder.updateStatus')}
            </div>
          </DialogTitle>
          <DialogDescription className="p-2 rounded-md bg-primary/10 text-primary">
            {tCommon('common.deleteNote')}
          </DialogDescription>

          <div className="py-4 text-sm text-gray-500">
            {t('chefOrder.confirmUpdateStatus')}
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
          <Button onClick={() => chefOrder && handleSubmit(chefOrder)}>
            {t('chefOrder.updateStatus')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
