import { useTranslation } from 'react-i18next';
import { DollarSign, CoffeeIcon, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { formatCurrency } from '@/utils';
import { IBranchRevenue } from '@/types';

interface RevenueData {
    revenueData: IBranchRevenue[] | undefined
}

export default function RevenueDetailSummary({ revenueData }: RevenueData) {
    const { t } = useTranslation(['revenue'])

    // get totalAmount
    const totalAmount = revenueData?.reduce((sum, item) => sum + (item.totalAmount || 0), 0) || 0;

    // get totalAmountCash
    const totalAmountCash = revenueData?.reduce((sum, item) => sum + (item.totalAmountCash || 0), 0) || 0;

    // get totalAmountBank
    const totalAmountBank = revenueData?.reduce((sum, item) => sum + (item.totalAmountBank || 0), 0) || 0;

    // get totalAmountInternal
    const totalAmountInternal = revenueData?.reduce((sum, item) => sum + (item.totalAmountInternal || 0), 0) || 0;

    // Tính tổng số đơn hàng
    const totalOrders = revenueData?.reduce((sum, item) => sum + (item.totalOrder || 0), 0) || 0;

    // calculate totalOrderItem
    // const totalOrderItem = revenueData?.reduce((sum, item) => sum + (item.totalOrderItem || 0), 0) || 0;

    return (
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-6">
            <Card className="text-white shadow-none bg-primary">
                <CardHeader className="flex flex-row justify-between items-center p-3 pb-2 space-y-0">
                    <CardTitle className="text-sm font-bold">
                        {t('revenue.totalRevenue')}
                    </CardTitle>
                    <DollarSign className="w-4 h-4" />
                </CardHeader>
                <CardContent className='p-3'>
                    <div className="text-xl font-bold">{formatCurrency(totalAmount)}</div>
                    {/* <p className="text-xs">+20.1% from last month</p> */}
                </CardContent>
            </Card>
            <Card className="shadow-none">
                <CardHeader className="flex flex-row justify-between items-center p-3 pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">
                        {t('revenue.totalOrders')}
                    </CardTitle>
                    <CoffeeIcon className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className='p-3'>
                    <div className="text-xl font-bold">{totalOrders}</div>
                    {/* <p className="text-xs text-muted-foreground">+15% from last month</p> */}
                </CardContent>
            </Card>
            <Card className="shadow-none">
                <CardHeader className="flex flex-row justify-between items-center p-3 pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">
                        {t('revenue.totalOrderItem')}
                    </CardTitle>
                    <CoffeeIcon className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className='p-3'>
                    {/* <div className="text-xl font-bold">{totalOrders}</div> */}
                    {/* <p className="text-xs text-muted-foreground">+15% from last month</p> */}
                </CardContent>
            </Card>
            <Card className="shadow-none">
                <CardHeader className="flex flex-row justify-between items-center p-3 pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">
                        {t('revenue.totalAmountCash')}
                    </CardTitle>
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className='p-3'>
                    <div className="text-xl font-bold">{formatCurrency(totalAmountCash)}</div>
                    {/* <p className="text-xs text-muted-foreground">+2.5% from last month</p> */}
                </CardContent>
            </Card>
            <Card className="shadow-none">
                <CardHeader className="flex flex-row justify-between items-center p-3 pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">
                        {t('revenue.totalAmountBank')}
                    </CardTitle>
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className='p-3'>
                    <div className="text-xl font-bold">{formatCurrency(totalAmountBank)}</div>
                    {/* <p className="text-xs text-muted-foreground">+2.5% from last month</p> */}
                </CardContent>
            </Card>
            <Card className="shadow-none">
                <CardHeader className="flex flex-row justify-between items-center p-3 pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">
                        {t('revenue.totalAmountInternal')}
                    </CardTitle>
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className='p-3'>
                    <div className="text-xl font-bold">{formatCurrency(totalAmountInternal)}</div>
                    {/* <p className="text-xs text-muted-foreground">+2.5% from last month</p> */}
                </CardContent>
            </Card>
        </div>
    );
}
