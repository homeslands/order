import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'

import { DataTable } from '@/components/ui'
import { usePromotionColumns } from './DataTable/columns'
import { usePagination, usePromotions } from '@/hooks'
import { PromotionAction } from './DataTable/actions'
import { useUserStore } from '@/stores'
import { Helmet } from 'react-helmet'

export default function PromotionPage() {
    const { t } = useTranslation(['promotion'])
    const { t: tHelmet } = useTranslation('helmet')
    const { handlePageChange, handlePageSizeChange } = usePagination()
    const { userInfo } = useUserStore()
    const { data, isLoading } = usePromotions(userInfo?.branch?.slug || '')

    return (
        <div className="flex flex-col flex-1 w-full">
            <Helmet>
                <meta charSet='utf-8' />
                <title>
                    {tHelmet('helmet.promotion.title')}
                </title>
                <meta name='description' content={tHelmet('helmet.promotion.title')} />
            </Helmet>
            <span className="flex items-center gap-1 text-lg">
                <SquareMenu />
                {t('promotion.promotionTitle')}
            </span>
            <div className="grid h-full grid-cols-1 gap-2 mt-4">
                <DataTable
                    columns={usePromotionColumns()}
                    data={data?.result || []}
                    isLoading={isLoading}
                    pages={1}
                    hiddenInput={false}
                    // filterOptions={EmployeeFilterOptions}
                    actionOptions={PromotionAction}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            </div>
        </div>
    )
}
