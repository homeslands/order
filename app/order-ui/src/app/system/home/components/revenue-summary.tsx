import { useEffect } from 'react';
import { DollarSign, CoffeeIcon, TrendingUp, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { useAllRevenue } from "@/hooks";
import { formatCurrency } from '@/utils';
import { RevenueTypeQuery } from '@/constants';

interface RevenueData {
    startDate: string;
    endDate: string;
    trigger?: number;
}

export default function RevenueSummary({ startDate, endDate, trigger }: RevenueData) {
    const { data: revenueData, refetch } = useAllRevenue(
        {
            startDate,
            endDate,
            type: RevenueTypeQuery.DAILY,
        }
    );

    // Refetch when trigger changes
    useEffect(() => {
        if (trigger) {
            refetch();
        }
    }, [trigger, refetch]);

    const today = new Date();

    const todayRevenue = revenueData?.result?.find((item) =>
        item.date && new Date(item.date).toDateString() === today.toDateString()
    );

    // Calculate total revenue today
    const totalRevenueToday = todayRevenue?.totalAmount || 0;

    // Calculate total revenue
    const totalRevenue = revenueData?.result?.reduce((sum, item) => sum + (item.totalAmount || 0), 0) || 0;

    // Calculate total orders
    const totalOrders = revenueData?.result?.reduce((sum, item) => sum + (item.totalOrder || 0), 0) || 0;

    // Calculate average order value
    const averageOrderValue = totalRevenue / totalOrders || 0;

    return (
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <Card className="text-white shadow-none bg-primary">
                <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                    <CardTitle className="text-sm font-bold">Tổng doanh thu</CardTitle>
                    <DollarSign className="w-4 h-4" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                    {/* <p className="text-xs">+20.1% from last month</p> */}
                </CardContent>
            </Card>
            <Card className="shadow-none">
                <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
                    <CoffeeIcon className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalOrders}</div>
                    {/* <p className="text-xs text-muted-foreground">+15% from last month</p> */}
                </CardContent>
            </Card>
            <Card className="shadow-none">
                <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">Giá trị đơn hàng trung bình</CardTitle>
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(averageOrderValue)}</div>
                    {/* <p className="text-xs text-muted-foreground">+2.5% from last month</p> */}
                </CardContent>
            </Card>
            <Card className="shadow-none">
                <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">Doanh thu hôm nay</CardTitle>
                    <Users className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalRevenueToday)}</div>
                    {/* <p className="text-xs text-muted-foreground">+8% from last month</p> */}
                </CardContent>
            </Card>
        </div>
    );
}
