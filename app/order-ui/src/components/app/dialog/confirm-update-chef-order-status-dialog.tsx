import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { CircleCheckBig, TriangleAlert } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui'

import { ChefOrderStatus, IChefOrders, IUpdateChefOrderStatusRequest } from '@/types'
import { useUpdateChefOrderStatus } from '@/hooks'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'

interface IConfirmUpdateChefOrderStatusDialogProps {
  chefOrder: IChefOrders | null
}

export default function ConfirmUpdateChefOrderStatusDialog({
  chefOrder,
}: IConfirmUpdateChefOrderStatusDialogProps) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['chefArea'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const [isOpen, onOpenChange] = useState(false)
  const { mutate: updateChefOrderStatus } = useUpdateChefOrderStatus()

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
        showToast(tToast('toast.updateChefOrderStatusSuccess'))
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center text-sm rounded-full w-fit"
                onClick={() => onOpenChange(true)}
              >
                <CircleCheckBig />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {t('chefOrder.updateStatus')}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md px-6 sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b border-primary text-primary">
            <div className="flex items-center gap-2">
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
        <DialogFooter className="flex flex-row justify-center gap-2">
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
