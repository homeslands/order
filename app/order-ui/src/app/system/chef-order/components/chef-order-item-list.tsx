import { IChefOrderItems } from '@/types'
import { ScrollArea } from '@/components/ui'
import ChefOrderItemDetail from './chef-order-item-detail'

interface IChefOrderItemListProps {
  chefOrderItemData?: IChefOrderItems[]
}

export default function ChefOrderItemList({
  chefOrderItemData,
}: IChefOrderItemListProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col w-full">
        <ScrollArea>
          {chefOrderItemData?.map((item) => (
            <div key={item.slug} className="grid items-center w-full gap-4">
              <ChefOrderItemDetail chefOrderItem={item} />
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  )
}
