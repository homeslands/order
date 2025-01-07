import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { OrderStatus } from "@/types";
import OrderList from "./orders-list";

export default function OrderTabs() {
    return (
        <Tabs defaultValue="all" className="flex flex-col w-full gap-4">
            <TabsList className="sticky z-10 grid grid-cols-3 gap-2 bg-white sm:grid-cols-6 top-5">
                <TabsTrigger value="all">Tất cả</TabsTrigger>
                <TabsTrigger value="shipping">Đang giao</TabsTrigger>
                <TabsTrigger value="completed">Đã giao</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
                <OrderList filter={OrderStatus.ALL} />
            </TabsContent>
            <TabsContent value="shipping">
                <OrderList filter={OrderStatus.SHIPPING} />
            </TabsContent>
            <TabsContent value="completed">
                <OrderList filter={OrderStatus.COMPLETED} />
            </TabsContent>
        </Tabs>
    );
}
