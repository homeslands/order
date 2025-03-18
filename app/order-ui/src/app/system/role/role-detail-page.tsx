import { useParams } from 'react-router-dom'
import moment from 'moment'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'

import { useRolePermissionListColumns } from './DataTable/columns'
import { useRoleBySlug } from '@/hooks'
import { ProductDetailSkeleton } from '@/components/app/skeleton'
import { AddPermissionSheet } from '@/components/app/sheet'
import { DataTable } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { UpdateRoleDialog } from '@/components/app/dialog'

export default function RoleDetailPage() {
    const { t } = useTranslation(['role'])
    const { t: tHelmet } = useTranslation('helmet')
    const { slug } = useParams()
    const { data: role, isLoading, refetch } = useRoleBySlug(slug as string)
    const columns = useRolePermissionListColumns({ onSuccess: () => refetch() })

    const roleDetail = role?.result

    if (isLoading) {
        return <ProductDetailSkeleton />
    }

    return (
        <div className="flex flex-col gap-3">
            <Helmet>
                <meta charSet='utf-8' />
                <title>
                    {tHelmet('helmet.role.title')}
                </title>
                <meta name='description' content={tHelmet('helmet.role.title')} />
            </Helmet>

            {/* Header Section */}
            <div className="flex flex-col gap-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        <SquareMenu className="w-6 h-6" />
                        <p>{t('role.title')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <UpdateRoleDialog role={roleDetail ? roleDetail : null} />
                        <AddPermissionSheet onSuccess={() => refetch()} />
                    </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{t(`role.${roleDetail?.name}`)}</span>
                    <Badge variant='outline'>{moment(roleDetail?.createdAt).format('hh:ss DD/MM/YYYY')}</Badge>
                </div>
            </div>

            {/* Permissions List */}
            <h2 className="mt-4 text-lg font-semibold">
                {t('role.authorityList')}
            </h2>
            <div className="grid grid-cols-1">
                <DataTable
                    columns={columns}
                    data={roleDetail?.permissions || []}
                    isLoading={isLoading}
                    pages={1}
                    onPageChange={() => { }}
                    onPageSizeChange={() => { }}
                />
            </div>
        </div>
    )
}
