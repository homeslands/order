import { SquareMenu } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { DataTable } from '@/components/ui'
import { useBanners } from '@/hooks'
import { useBannerColumns } from './DataTable/columns'
import { BannerActionOptions } from './DataTable/actions'
import { Helmet } from 'react-helmet'


export default function BannerPage() {
    const { t } = useTranslation(['banner'])
    const { t: tHelmet } = useTranslation('helmet')
    const { data, isLoading } = useBanners()

    return (
        <div className="flex flex-col flex-1 w-full">
            <Helmet>
                <meta charSet='utf-8' />
                <title>
                    {tHelmet('helmet.banner.title')}
                </title>
                <meta name='description' content={tHelmet('helmet.banner.title')} />
            </Helmet>
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
    )
}
