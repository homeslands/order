import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useGetSpecificChefOrder } from '@/hooks'
import { IChefOrders } from '@/types'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui'
import { ChefOrderItemList } from '@/app/system/chef-order/components'
import { useSearchParams } from 'react-router-dom'

interface IChefOrderItemDetailSheetProps {
  chefOrder: IChefOrders | undefined
  enableFetch: boolean
  isOpen: boolean
  onClose: () => void
}

export default function ChefOrderItemDetailSheet({
  chefOrder,
  enableFetch,
  isOpen,
  onClose,
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
    }, 3000) // Polling every 5 seconds

    return () => clearInterval(interval) // Cleanup
  }, [data, refetch])
  const specificChefOrderDetail = data?.result.chefOrderItems || []
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[90%] overflow-y-auto p-2">
        <SheetHeader>
          <SheetTitle className="flex justify-between items-center mt-8">
            {t('chefOrder.chefOrderDetail')}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          {chefOrder ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 p-2 rounded-lg border-2 border-primary bg-primary/5 sm:p-4">
                <ChefOrderItemList chefOrderItemData={specificChefOrderDetail} />
              </div>
            </div>
          ) : (
            <p className="flex min-h-[12rem] items-center justify-center text-muted-foreground">
              {tCommon('common.noData')}
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
