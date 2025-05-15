import moment from 'moment'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import {
    Button, Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui'
import { DeleteChefAreaDialog, UpdateChefAreaDialog } from '@/components/app/dialog'
import { IChefArea } from '@/types'
import { ROUTE } from '@/constants'

export default function ChefAreaCard({ chefArea, isDeletePermissionValid, isUpdatePermissionValid }: { chefArea: IChefArea, isDeletePermissionValid: boolean, isUpdatePermissionValid: boolean }) {
    const { t } = useTranslation(['chefArea'])
    const { t: tCommon } = useTranslation('common')

    return (
        <div className='flex flex-col gap-2 rounded-md border border-muted-foreground/30' key={chefArea.slug}>
            <div className='p-4'>
                <div className='flex gap-2 justify-between items-center'>
                    <span className='text-xl font-extrabold'>{chefArea.name}</span>
                </div>
                <div className='text-sm text-muted-foreground'>
                    {chefArea.description}
                </div>
                <div className='mt-3 text-sm text-muted-foreground'>
                    {t('chefArea.createdAt')}: {moment(chefArea.createdAt).format('DD/MM/YYYY')}
                </div>
            </div>
            <div className='flex justify-between items-center p-4 border-t bg-muted-foreground/10'>
                <NavLink to={`${ROUTE.STAFF_CHEF_AREA_MANAGEMENT}/${chefArea.slug}`}>
                    <Button>
                        {tCommon('common.viewDetail')}
                    </Button>
                </NavLink>
                <div className='flex'>
                    <TooltipProvider delayDuration={100}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" className='text-muted-foreground' disabled={!isUpdatePermissionValid}>
                                    <UpdateChefAreaDialog chefArea={chefArea} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('chefArea.update')}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider delayDuration={100}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" className='text-destructive' disabled={!isDeletePermissionValid}>
                                    <DeleteChefAreaDialog chefArea={chefArea} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('chefArea.delete')}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </div>
    )
}