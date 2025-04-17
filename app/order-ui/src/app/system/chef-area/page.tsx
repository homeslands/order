import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'

import { useBranch, useGetAuthorityGroup, useGetChefAreas } from '@/hooks'
import { useBranchStore, useUserStore } from '@/stores'
import { CreateChefAreaDialog } from '@/components/app/dialog'
import { ChefAreaCard } from './components'
import { BranchSelect } from '@/components/app/select'
import { hasPermissionInBoth } from '@/utils'

export default function ChefAreaPage() {
    const { t } = useTranslation(['chefArea'])
    const { t: tHelmet } = useTranslation('helmet')
    const { data: authorityData } = useGetAuthorityGroup({})
    const { userInfo } = useUserStore()
    const { branch } = useBranchStore()
    const authorityGroup = authorityData?.result ?? [];
    const authorityGroupCodes = authorityGroup.flatMap(group => group.authorities.map(auth => auth.code));
    const userPermissionCodes = userInfo?.role.permissions.map(p => p.authority.code) ?? [];

    const isViewPermissionValid = hasPermissionInBoth("VIEW_KITCHEN_AREA", authorityGroupCodes, userPermissionCodes);
    const isDeletePermissionValid = hasPermissionInBoth("DELETE_KITCHEN_AREA", authorityGroupCodes, userPermissionCodes);
    const isUpdatePermissionValid = hasPermissionInBoth("UPDATE_KITCHEN_AREA", authorityGroupCodes, userPermissionCodes);

    const { data: areaData } = useGetChefAreas(branch?.slug || '')
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
            <span className="flex gap-1 justify-between items-center pt-1 text-lg">
                <div className='flex gap-2 items-center'>
                    <SquareMenu />
                    {t('chefArea.title')}
                </div>
                <div className='flex gap-2 items-center'>
                    {isViewPermissionValid && <BranchSelect />}
                    {isViewPermissionValid && <CreateChefAreaDialog />}
                </div>
            </span>
            <div className='flex flex-col gap-4 pb-4'>
                {branchGroups?.length > 0 ? branchGroups.map((group) => (
                    group.areas.length > 0 &&
                    <div className='gap-4 mt-4 w-full' key={group.slug}>
                        <div className='uppercase primary-highlight'>{group.name} - {group.address}</div>
                        <div className="grid grid-cols-1 gap-2 mt-3 h-full sm:grid-cols-2">
                            {group.areas.map((area) => (
                                <ChefAreaCard key={area.slug} chefArea={area} isDeletePermissionValid={isDeletePermissionValid} isUpdatePermissionValid={isUpdatePermissionValid} />
                            ))}
                        </div>
                    </div>
                )) : <p>{t('chefArea.noData')}</p>}
            </div>
        </div>
    )
}
