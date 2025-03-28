import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'

import { useBranch, useGetChefAreas } from '@/hooks'
import { useUserStore } from '@/stores'
import { CreateChefAreaDialog } from '@/components/app/dialog'
import { ChefAreaCard } from './components'

export default function ChefAreaPage() {
    const { t } = useTranslation(['chefArea'])
    const { t: tHelmet } = useTranslation('helmet')
    const { userInfo } = useUserStore()
    const { data: areaData } = useGetChefAreas(userInfo?.branch?.slug || '')
    const { data: branchData } = useBranch();
    const branchGroups = (branchData?.result || []).map((branch) => ({
        ...branch,
        areas: areaData?.result.filter((area) => area.branch.slug === branch.slug) || [],
    })).sort((a, b) => a.name.localeCompare(b.name))

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
            {branchGroups?.length > 0 ? branchGroups.map((group) => (
                group.areas.length > 0 &&
                <div className='w-full mt-8' key={group.slug}>
                    <div className='primary-highlight uppercase'>{group.name} - {group.address}</div>
                    <div className="grid h-full grid-cols-1 gap-2 mt-3 sm:grid-cols-2">
                        {group.areas.map((area) => (
                            <ChefAreaCard key={area.slug} chefArea={area} />
                        ))}
                    </div>
                </div>
            )) : <p>{t('chefArea.noData')}</p>}


        </div>
    )
}
