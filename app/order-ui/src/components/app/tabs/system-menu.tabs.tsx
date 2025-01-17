import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { SystemTableSelect } from '../select'
import { SystemMenuTabscontent } from '../tabscontent'

export function SystemMenuTabs() {
  return (
    <Tabs defaultValue="menu" className="">
      <TabsList className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-6 lg:mb-0">
        <TabsTrigger value="menu" className="flex justify-center">
          Menu
        </TabsTrigger>
        <TabsTrigger value="table" className="flex justify-center">
          Table
        </TabsTrigger>
      </TabsList>
      <TabsContent value="menu" className="w-full p-0">
        <SystemMenuTabscontent />
      </TabsContent>
      <TabsContent value="table" className="p-0">
        <SystemTableSelect />
      </TabsContent>
    </Tabs>
  )
}
