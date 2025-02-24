import { SquareMenu } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { DataTable } from '@/components/ui'
import { useBanners } from '@/hooks'
import { useBannerColumns } from './DataTable/columns'
import { BannerActionOptions } from './DataTable/actions'


export default function BannerPage() {
    const { data, isLoading } = useBanners()
    const { t } = useTranslation(['banner'])

    return (
        <div className={`pl-4 transition-all duration-300 ease-in-out`}>
            <div className="sticky top-0 z-10 flex flex-col items-center gap-2 pb-4 pr-4">
                <div className="flex flex-col flex-1 w-full">
                    <span className="flex items-center gap-1 text-lg">
                        <SquareMenu />
                        {t('banner.bannerTitle')}
                    </span>
                    <div className="grid h-full grid-cols-1 gap-2">
                        <DataTable
                            columns={useBannerColumns()}
                            data={data?.result || []}
                            isLoading={isLoading}
                            pages={1}
                            onPageChange={() => { }}
                            onPageSizeChange={() => { }}
                            actionOptions={BannerActionOptions}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
