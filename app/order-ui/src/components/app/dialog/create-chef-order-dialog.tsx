import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Bell, TriangleAlert } from 'lucide-react'

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

import { IOrder } from '@/types'
import { useCreateChefOrder } from '@/hooks'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'

interface CreateChefOrderDialogProps {
  order: IOrder
}

export default function CreateChefOrderDialog({ order }: CreateChefOrderDialogProps) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['chefArea'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { mutate: createChefOrder } = useCreateChefOrder()
  const [isOpen, setIsOpen] = useState(false)

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
  }

  const handleSubmit = (orderSlug: string) => {
    createChefOrder({ order: orderSlug }, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.chefOrders],
        })
        handleOpenChange(false)
        showToast(tToast('toast.createChefOrderSuccess'))
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="flex gap-1 justify-start px-2 w-full text-sm"
        >
          <Bell className="icon" />
          {t('chefOrder.create')}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b border-destructive text-destructive">
            <div className="flex gap-2 items-center">
              <TriangleAlert className="w-6 h-6" />
              {t('chefOrder.create')}
            </div>
          </DialogTitle>
          <DialogDescription className={`p-2 bg-red-100 rounded-md dark:bg-transparent text-destructive`}>
            {tCommon('common.deleteNote')}
          </DialogDescription>

          <div className="py-4 text-sm text-muted-foreground">
            {t('chefOrder.createChefOrderWarning')}{' '}
            <span className="font-bold">{order?.slug}</span> <br />
            <br />
            {t('chefOrder.createChefOrderConfirmation')}
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row gap-2 justify-center">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {tCommon('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => order && handleSubmit(order.slug || '')}
          >
            {t('chefOrder.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
