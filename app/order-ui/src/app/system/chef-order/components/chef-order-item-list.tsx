import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ISpecificChefOrderItemInfo, ChefOrderItemStatus, ChefOrderStatus } from '@/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import ChefOrderItemDetail from './chef-order-item-detail'
import { ScrollAreaViewport } from '@radix-ui/react-scroll-area'

interface IChefOrderItemListProps {
  onSuccess: () => void
  chefOrderStatus: ChefOrderStatus | undefined
  chefOrderItemData?: ISpecificChefOrderItemInfo[]
}

export default function ChefOrderItemList({
  chefOrderStatus,
  chefOrderItemData,
  onSuccess,
}: IChefOrderItemListProps) {
  const { t } = useTranslation(['chefArea'])
  const { t: tCommon } = useTranslation('common')
  const [activeTab, setActiveTab] = useState<ChefOrderItemStatus>(ChefOrderItemStatus.PENDING)

  const getStatusCounts = () => {
    if (!chefOrderItemData) return { pending: 0, inProgress: 0, completed: 0 }

    return chefOrderItemData.reduce((acc, item) => {
      switch (item.status) {
        case ChefOrderItemStatus.PENDING:
          acc.pending++
          break
        case ChefOrderItemStatus.IN_PROGRESS:
          acc.inProgress++
          break
        case ChefOrderItemStatus.COMPLETED:
          acc.completed++
          break
      }
      return acc
    }, { pending: 0, inProgress: 0, completed: 0 })
  }

  const { pending, inProgress, completed } = getStatusCounts()

  const filteredItems = chefOrderItemData?.filter(item => item.status === activeTab) || []

  return (
    <div>
      {/* Cooking Timeline */}
      {/* <div className="flex flex-col gap-3 p-4 bg-white rounded-lg border shadow-sm"> */}
      {/* <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-muted-foreground">{t('chefOrder.cookingStatus')}</h3>
        </div> */}

      {/* <div className="relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted-foreground/20 -translate-y-1/2"></div>
          <div className="flex relative justify-between">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${pending > 0 ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                <Clock className={`w-4 h-4 ${pending > 0 ? 'text-yellow-500' : 'text-gray-400'}`} />
              </div>
              <span className="mt-1 text-xs font-medium text-gray-600">{t('chefOrder.pending')}</span>
              <span className="text-xs text-gray-500">{pending} {t('chefOrder.items')}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${inProgress > 0 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <AlertCircle className={`w-4 h-4 ${inProgress > 0 ? 'text-blue-500' : 'text-gray-400'}`} />
              </div>
              <span className="mt-1 text-xs font-medium text-gray-600">{t('chefOrder.cooking')}</span>
              <span className="text-xs text-gray-500">{inProgress} {t('chefOrder.items')}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${completed > 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
                <CheckCircle2 className={`w-4 h-4 ${completed > 0 ? 'text-green-500' : 'text-gray-400'}`} />
              </div>
              <span className="mt-1 text-xs font-medium text-gray-600">{t('chefOrder.completed')}</span>
              <span className="text-xs text-gray-500">{completed} {t('chefOrder.items')}</span>
            </div>
          </div>
        </div> */}
      {/* </div> */}

      {/* Order Items List with Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ChefOrderItemStatus)} className="w-full h-full rounded-lg border-2 border-primary bg-primary/5 sm:p-4">
        <TabsList className={`grid grid-cols-3 px-1 py-0 text-[0.5rem] sm:text-sm`}>
          <TabsTrigger value={ChefOrderItemStatus.PENDING} className="min-w-[6rem] whitespace-nowrap">
            {t('chefOrder.pending')} ({pending})
          </TabsTrigger>
          <TabsTrigger value={ChefOrderItemStatus.IN_PROGRESS} className="min-w-[6rem] whitespace-nowrap">
            {t('chefOrder.cooking')} ({inProgress})
          </TabsTrigger>
          <TabsTrigger value={ChefOrderItemStatus.COMPLETED} className="min-w-[6rem] whitespace-nowrap">
            {t('chefOrder.completed')} ({completed})
          </TabsTrigger>
        </TabsList>
        <TabsContent value={ChefOrderItemStatus.PENDING} className='h-[calc(100vh-11em)]'>
          <ScrollAreaViewport className="h-[calc(100vh-12em)]">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div key={item.slug} className="grid gap-4 items-center w-full">
                  <ChefOrderItemDetail onSuccess={onSuccess} chefOrderStatus={chefOrderStatus || ChefOrderStatus.PENDING} chefOrderItem={item} />
                </div>
              ))
            ) : (
              <p className="flex min-h-[12rem] items-center justify-center text-muted-foreground">
                {tCommon('common.noData')}
              </p>
            )}
          </ScrollAreaViewport>
        </TabsContent>
        <TabsContent value={ChefOrderItemStatus.IN_PROGRESS} className='h-[calc(100vh-11em)]'>
          <ScrollAreaViewport className="h-[calc(100vh-12em)]">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div key={item.slug} className="grid gap-4 items-center w-full">
                  <ChefOrderItemDetail onSuccess={onSuccess} chefOrderItem={item} chefOrderStatus={chefOrderStatus || ChefOrderStatus.PENDING} />
                </div>
              ))
            ) : (
              <p className="flex min-h-[12rem] items-center justify-center text-muted-foreground">
                {tCommon('common.noData')}
              </p>
            )}
          </ScrollAreaViewport>
        </TabsContent>
        <TabsContent value={ChefOrderItemStatus.COMPLETED} className='h-[calc(100vh-11em)]'>
          <ScrollAreaViewport className="h-[calc(100vh-12em)]">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div key={item.slug} className="grid gap-4 items-center w-full">
                  <ChefOrderItemDetail onSuccess={onSuccess} chefOrderStatus={chefOrderStatus || ChefOrderStatus.PENDING} chefOrderItem={item} />
                </div>
              ))
            ) : (
              <p className="flex min-h-[12rem] items-center justify-center text-muted-foreground">
                {tCommon('common.noData')}
              </p>
            )}
          </ScrollAreaViewport>
        </TabsContent>
      </Tabs>
    </div >
  )
}
