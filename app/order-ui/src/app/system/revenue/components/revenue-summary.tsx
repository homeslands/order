import { DollarSign, CoffeeIcon, TrendingUp, Users } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { useRevenue } from "@/hooks"
import moment from 'moment'

interface RevenueData {
    startDate?: string
    endDate?: string
}

export default function RevenueSummary({ startDate, endDate }: RevenueData) {
    // Set default dates to today if not provided
    const today = moment().toISOString()
    const defaultStartDate = startDate || today
    const defaultEndDate = endDate || today

    const { data: revenueData } = useRevenue({
        startDate: defaultStartDate,
        endDate: defaultEndDate,
    })

    // Calculate total revenue for today
    const todayRevenue = revenueData?.result?.find((item) =>
        item.date && moment(item.date).isSame(moment(), 'day')
    );
    const totalRevenueToday = todayRevenue?.totalAmount || 0;

    // Format revenue to VND
    const formattedRevenueToday = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenueToday);

    // Calculate total revenue
    const totalRevenue = revenueData?.result?.reduce((sum: number, item: { totalAmount: number }) =>
        sum + (item.totalAmount || 0), 0) || 0;

    // Format revenue to VND
    const formattedRevenue = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue);

    // Calculate total orders
    const totalOrders = revenueData?.result?.reduce((sum: number, item: { totalOrder: number }) =>
        sum + (item.totalOrder || 0), 0) || 0;

    const averageOrderValue = totalRevenue / totalOrders || 0;

    const formattedAverageOrderValue = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(averageOrderValue);

    return (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
            <Card className="text-white shadow-none bg-primary">
                <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                    <CardTitle className="text-sm font-bold">Tổng doanh thu</CardTitle>
                    <DollarSign className="w-4 h-4" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formattedRevenue}</div>
                    <p className="text-xs">+20.1% from last month</p>
                </CardContent>
            </Card>
            <Card className="shadow-none">
                <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
                    <CoffeeIcon className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalOrders}</div>
                    <p className="text-xs text-muted-foreground">+15% from last month</p>
                </CardContent>
            </Card>
            <Card className="shadow-none">
                <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">Giá trị đơn hàng trung bình</CardTitle>
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formattedAverageOrderValue}</div>
                    <p className="text-xs text-muted-foreground">+2.5% from last month</p>
                </CardContent>
            </Card>
            <Card className="shadow-none">
                <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
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

