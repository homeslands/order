import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TriangleAlert } from 'lucide-react'

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

export default function DeleteSizeDialog({ order }: { order: IOrder }) {
  const { t } = useTranslation(['menu'])
  const { t: tCommon } = useTranslation('common')
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (catalogSlug: string) => {
    console.log('catalogSlug', catalogSlug)
    // deleteSize(catalogSlug, {
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({
    //       queryKey: ['size'],
    //     })
    //     setIsOpen(false)
    //     showToast(tToast('toast.deleteSizeSuccess'))
    //   },
    // })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="flex justify-start w-full" asChild>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="gap-1 px-2 text-sm"
            onClick={() => setIsOpen(true)}
          >
            {t('order.cancelOrder')}
          </Button>
        </DialogTrigger>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b border-destructive text-destructive">
            <div className="flex items-center gap-2">
              <TriangleAlert className="w-6 h-6" />
              {t('order.cancelOrder')}
            </div>
          </DialogTitle>
          <DialogDescription className="p-2 bg-red-100 rounded-md text-destructive">
            {tCommon('common.deleteNote')}
          </DialogDescription>

          <div className="py-4 text-sm text-muted-foreground">
            {t('order.cancelOrderWarning')}{' '}
            <br />
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-center gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {tCommon('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => order && handleSubmit(order.slug || '')}
          >
            {tCommon('common.confirmCancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
