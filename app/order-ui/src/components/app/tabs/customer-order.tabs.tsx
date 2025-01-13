import CustomerOrderTabsContent from '@/components/app/tabscontent/customer-order.tabscontent'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { OrderStatus } from '@/types'

export default function CustomerOrderTabs() {
  return (
    <Tabs defaultValue="all" className="flex w-full flex-col gap-4">
      <TabsList className="sticky top-5 z-10 flex items-center gap-2 bg-white">
        <TabsTrigger value="all" className="flex w-1/3 justify-center">
          Tất cả
        </TabsTrigger>
        <TabsTrigger value="shipping" className="flex w-1/3 justify-center">
          Đang giao
        </TabsTrigger>
        <TabsTrigger value="completed" className="flex w-1/3 justify-center">
          Đã giao
        </TabsTrigger>
      </TabsList>
      <TabsContent value="all">
        <CustomerOrderTabsContent status={OrderStatus.ALL} />
      </TabsContent>
      <TabsContent value="shipping">
        <CustomerOrderTabsContent status={OrderStatus.SHIPPING} />
      </TabsContent>
      <TabsContent value="completed">
        <CustomerOrderTabsContent status={OrderStatus.COMPLETED} />
      </TabsContent>
    </Tabs>
  )
}
