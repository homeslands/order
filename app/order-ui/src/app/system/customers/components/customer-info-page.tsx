import { useEffect, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import {
    SystemCustomerInfoTabsContent,
    SystemCustomerLoyaltyPointTabsContent,
    SystemCustomerOrderHistoryTabsContent
} from '@/components/app/tabscontent'

export default function CustomerInfoPage() {
    const { t } = useTranslation(['customer'])
    const location = useLocation()
    const [searchParams, setSearchParams] = useSearchParams()
    const [tab, setTab] = useState(searchParams.get('tab') || 'info')

    useEffect(() => {
        setTab(searchParams.get('tab') || 'info')
    }, [searchParams, location])

    const handleTabChange = (newTab: string) => {
        setTab(newTab)
        setSearchParams({ tab: newTab }) // Cập nhật URL khi thay đổi tab
    }

    return (
        <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="scrollbar-hide mb-6 flex h-full w-full !justify-start gap-3 overflow-x-auto lg:mb-0">
                <TabsTrigger
                    value="info"
                    className="min-w-[100px] flex-shrink-0 justify-center whitespace-nowrap px-3"
                >
                    {t('customer.info')}
                </TabsTrigger>
                <TabsTrigger
                    value="history"
                    className="min-w-[100px] flex-shrink-0 justify-center whitespace-nowrap px-3 text-center dark:text-gray-400 dark:hover:text-gray-300 dark:data-[state=active]:text-white"
                >
                    {t('customer.orderHistory')}
                </TabsTrigger>
                <TabsTrigger
                    value="loyalty-point"
                    className="min-w-[100px] flex-shrink-0 justify-center whitespace-nowrap px-3 text-center dark:text-gray-400 dark:hover:text-gray-300 dark:data-[state=active]:text-white"
                >
                    {t('customer.loyaltyPoint')}
                </TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="p-0 w-full dark:text-gray-200">
                <SystemCustomerInfoTabsContent />
            </TabsContent>
            <TabsContent value="loyalty-point" className="p-0 w-full dark:text-gray-200">
                <SystemCustomerLoyaltyPointTabsContent />
            </TabsContent>
            <TabsContent value="history" className="p-0 w-full">
                <SystemCustomerOrderHistoryTabsContent />
            </TabsContent>
        </Tabs>
    )
}


