import { useTranslation } from 'react-i18next';
import { CoffeeIcon, CreditCard, Coins, ChartColumn, CircleDollarSign } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { formatCurrency } from '@/utils';
import { IBranchRevenue, IBranchTopProduct } from '@/types';

interface RevenueData {
    revenueData: IBranchRevenue[] | undefined
    topProduct: IBranchTopProduct[] | undefined
}

export default function RevenueDetailSummary({ revenueData, topProduct }: RevenueData) {
    const { t } = useTranslation(['revenue'])

    // get total product
    const totalProduct = topProduct?.reduce((sum, item) => sum + (item.totalQuantity || 0), 0) || 0;

    // get totalAmount
    const totalAmount = revenueData?.reduce((sum, item) => sum + (item.totalAmount || 0), 0) || 0;

    // get totalAmountCash
    const totalAmountCash = revenueData?.reduce((sum, item) => sum + (item.totalAmountCash || 0), 0) || 0;

    // get totalAmountBank
    const totalAmountBank = revenueData?.reduce((sum, item) => sum + (item.totalAmountBank || 0), 0) || 0;

    // get totalAmountPoint
    const totalAmountPoint = revenueData?.reduce((sum, item) => sum + (item.totalAmountPoint || 0), 0) || 0;

    // get totalAmountCreditCard
    const totalAmountCreditCard = revenueData?.reduce((sum, item) => sum + (item.totalAmountCreditCard || 0), 0) || 0;

    // Tính tổng số đơn hàng
    const totalOrders = revenueData?.reduce((sum, item) => sum + (item.totalOrder || 0), 0) || 0;

    // calculate totalOrderItem
    // const totalOrderItem = revenueData?.reduce((sum, item) => sum + (item.totalOrderItem || 0), 0) || 0;

    return (
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <Card className="text-white shadow-none bg-primary">
                <CardHeader className="flex flex-row justify-between items-center p-3 pb-2 space-y-0">
                    <CardTitle className="text-sm font-bold">
                        {t('revenue.totalRevenue')}
                    </CardTitle>
                    <ChartColumn className="w-4 h-4" />
                </CardHeader>
                <CardContent className='p-3'>
                    <div className="text-xl font-bold">{formatCurrency(totalAmount)}</div>
                    {/* <p className="text-xs">+20.1% from last month</p> */}
                </CardContent>
            </Card>
            <Card className="bg-white shadow-none dark:bg-transparent">
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
            <Card className="bg-white shadow-none dark:bg-transparent">
                <CardHeader className="flex flex-row justify-between items-center p-3 pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">
                        {t('revenue.totalOrderItem')}
                    </CardTitle>
                    <CoffeeIcon className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className='p-3'>
                    <div className="text-xl font-bold">{totalProduct}</div>
                    {/* <p className="text-xs text-muted-foreground">+15% from last month</p> */}
                </CardContent>
            </Card>
            {/* <Card className="shadow-none">
                <CardHeader className="flex flex-row justify-between items-center p-3 pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">
                        {t('revenue.totalOrderItem')}
                    </CardTitle>
                    <CoffeeIcon className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className='p-3'>
                </CardContent>
            </Card> */}
            <Card className="shadow-none">
                <CardHeader className="flex flex-row justify-between items-center p-3 pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">
                        {t('revenue.totalAmountCash')}
                    </CardTitle>
                    <CircleDollarSign className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className='p-3'>
                    <div className="text-xl font-bold">{formatCurrency(totalAmountCash)}</div>
                    {/* <p className="text-xs text-muted-foreground">+2.5% from last month</p> */}
                </CardContent>
            </Card>
            <Card className="bg-white shadow-none dark:bg-transparent">
                <CardHeader className="flex flex-row justify-between items-center p-3 pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">
                        {t('revenue.totalAmountBank')}
                    </CardTitle>
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className='p-3'>
                    <div className="text-xl font-bold">{formatCurrency(totalAmountBank)}</div>
                    {/* <p className="text-xs text-muted-foreground">+2.5% from last month</p> */}
                </CardContent>
            </Card>
            <Card className="bg-white shadow-none dark:bg-transparent">
                <CardHeader className="flex flex-row justify-between items-center p-3 pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">
                        {t('revenue.totalAmountCreditCard')}
                    </CardTitle>
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className='p-3'>
                    <div className="text-xl font-bold">{formatCurrency(totalAmountCreditCard)}</div>
                </CardContent>
            </Card>
            <Card className="bg-white shadow-none dark:bg-transparent">
                <CardHeader className="flex flex-row justify-between items-center p-3 pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">
                        {t('revenue.totalAmountPoint')}
                    </CardTitle>
                    <Coins className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className='p-3'>
                    <div className="text-xl font-bold">{formatCurrency(totalAmountPoint, '')}</div>
                </CardContent>
            </Card>
        </div>
    );
}
