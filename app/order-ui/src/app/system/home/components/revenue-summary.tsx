import { DollarSign, CoffeeIcon, TrendingUp, Users } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { useRevenue } from "@/hooks"

interface RevenueData {
    startDate: string
    endDate: string
}

export default function RevenueSummary({ startDate, endDate }: RevenueData) {
    const { data: revenueData } = useRevenue({
        startDate,
        endDate,
    })

    const { data: CurrentRevenueData } = useRevenue({
        startDate,
        endDate,
    })

    //Tính tổng doanh thu ngày hiện tại
    const totalRevenueToday = CurrentRevenueData?.result?.reduce((sum, item) => sum + (item.totalAmount || 0), 0) || 0;

    //Định dạng revenue thành VND
    const formattedRevenueToday = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenueToday);

    // Tính tổng revenue
    const totalRevenue = revenueData?.result?.reduce((sum, item) => sum + (item.totalAmount || 0), 0) || 0;

    // Định dạng revenue thành VND
    const formattedRevenue = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue);

    //Tính tổng đơn hàng
    const totalOrders = revenueData?.result?.reduce((sum, item) => sum + (item.totalOrder || 0), 0) || 0;

    const averageOrderValue = totalRevenue / totalOrders || 0;

    const formattedAverageOrderValue = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(averageOrderValue);

    return (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
            <Card className="text-white shadow-none bg-primary">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-bold">Tổng doanh thu</CardTitle>
                    <DollarSign className="w-4 h-4" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formattedRevenue}</div>
                    <p className="text-xs">+20.1% from last month</p>
                </CardContent>
            </Card>
            <Card className="shadow-none">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
                    <CoffeeIcon className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalOrders}</div>
                    <p className="text-xs text-muted-foreground">+15% from last month</p>
                </CardContent>
            </Card>
            <Card className="shadow-none">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">Giá trị đơn hàng trung bình</CardTitle>
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formattedAverageOrderValue}</div>
                    <p className="text-xs text-muted-foreground">+2.5% from last month</p>
                </CardContent>
            </Card>
            <Card className="shadow-none">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">Doanh thu hôm nay</CardTitle>
                    <Users className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formattedRevenueToday}</div>
                    <p className="text-xs text-muted-foreground">+8% from last month</p>
                </CardContent>
            </Card>
        </div>
    )
}

