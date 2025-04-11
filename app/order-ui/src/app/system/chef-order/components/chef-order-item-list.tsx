import { useTranslation } from 'react-i18next'
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { ISpecificChefOrderItemInfo, ChefOrderItemStatus } from '@/types'
import { ScrollArea } from '@/components/ui'
import ChefOrderItemDetail from './chef-order-item-detail'

interface IChefOrderItemListProps {
  chefOrderItemData?: ISpecificChefOrderItemInfo[]
}

export default function ChefOrderItemList({
  chefOrderItemData,
}: IChefOrderItemListProps) {
  const { t } = useTranslation(['chefArea'])
  // console.log(chefOrderItemData)

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

  return (
    <div className="flex flex-col gap-4">
      {/* Cooking Timeline */}
      <div className="flex flex-col gap-3 p-4 bg-white rounded-lg border shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-muted-foreground">{t('chefOrder.cookingStatus')}</h3>
        </div>

        <div className="relative">
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
        </div>
      </div>

      {/* Order Items List */}
      <div className="flex flex-col gap-1">
        <div className="flex flex-col w-full">
          <ScrollArea>
            {chefOrderItemData?.map((item) => (
              <div key={item.slug} className="grid gap-4 items-center w-full">
                <ChefOrderItemDetail chefOrderItem={item} />
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
