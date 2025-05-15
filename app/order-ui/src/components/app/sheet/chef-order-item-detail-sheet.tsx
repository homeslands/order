import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useGetSpecificChefOrder } from '@/hooks'
import { IChefOrders } from '@/types'
import { Button, Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui'
import { ChefOrderItemList } from '@/app/system/chef-order/components'
import { useSearchParams } from 'react-router-dom'

interface IChefOrderItemDetailSheetProps {
  chefOrder: IChefOrders | undefined
  enableFetch: boolean
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function ChefOrderItemDetailSheet({
  chefOrder,
  enableFetch,
  isOpen,
  onClose,
  onSuccess,
}: IChefOrderItemDetailSheetProps) {
  const { t: tCommon } = useTranslation(['common'])
  const { t } = useTranslation(['chefArea'])
  const [searchParams] = useSearchParams()
  const slug = searchParams.get('slug') || ''

  const { data, refetch } = useGetSpecificChefOrder(
    enableFetch ? (chefOrder?.slug ?? '') : slug,
  )

  // polling useGetSpecificChefOrder every 5 seconds
  useEffect(() => {
    if (!data) return
    const interval = setInterval(async () => {
      try {
        await refetch()
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        /* empty */
      }
    }, 3000) // Polling every 3 seconds

    return () => clearInterval(interval) // Cleanup
  }, [data, refetch])
  const specificChefOrderDetail = data?.result.chefOrderItems || []
  const chefOrderStatus = data?.result.status
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[100%] p-0 flex flex-col gap-0 max-h-screen">
        <SheetHeader className="px-2">
          <SheetTitle className="flex justify-between items-center mt-8">
            {t('chefOrder.chefOrderDetail')}
          </SheetTitle>
        </SheetHeader>
        {chefOrder ? (
          <div className="h-[calc(100vh-11rem)] flex-1 px-2 pt-2">
            <ChefOrderItemList onSuccess={onSuccess} chefOrderStatus={chefOrderStatus} chefOrderItemData={specificChefOrderDetail} />
          </div>
        ) : (
          <p className="flex min-h-[12rem] items-center justify-center text-muted-foreground">
            {tCommon('common.noData')}
          </p>
        )}
        <SheetFooter className="p-2">
          <Button onClick={onClose}>
            {tCommon('common.close')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet >
  )
}
