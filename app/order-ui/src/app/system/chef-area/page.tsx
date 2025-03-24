import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'

import { useGetChefAreas } from '@/hooks'
import { useUserStore } from '@/stores'
import { CreateChefAreaDialog } from '@/components/app/dialog'
import { ChefAreaCard } from './components'

export default function ChefAreaPage() {
    const { t } = useTranslation(['chefArea'])
    const { t: tHelmet } = useTranslation('helmet')
    const { userInfo } = useUserStore()
    const { data } = useGetChefAreas(userInfo?.branch?.slug || '')

    const areas = data?.result || []

    return (
        <div className="flex flex-col flex-1 w-full">
            <Helmet>
                <meta charSet='utf-8' />
                <title>
                    {tHelmet('helmet.chefArea.title')}
                </title>
                <meta name='description' content={tHelmet('helmet.chefArea.title')} />
            </Helmet>
            <span className="flex items-center justify-between gap-1 text-lg">
                <div className='flex items-center gap-2'>
                    <SquareMenu />
                    {t('chefArea.title')}
                </div>
                <CreateChefAreaDialog />
            </span>
            <div className="grid h-full grid-cols-1 gap-2 mt-4 sm:grid-cols-2">
                {areas.map((area) => (
                    <ChefAreaCard key={area.slug} chefArea={area} />
                ))}
            </div>
        </div>
    )
}
