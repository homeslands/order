
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'

import { DataTable } from '@/components/ui'
import { useRoles } from '@/hooks'
import { useRoleListColumns } from './DataTable/columns'
import { useNavigate } from 'react-router-dom'
import { IRole } from '@/types'
import { ROUTE } from '@/constants'

export default function RolePage() {
    const navigate = useNavigate()
    const { t: tHelmet } = useTranslation('helmet')
    const { t } = useTranslation('role')
    const { data, isLoading } = useRoles()

    const handleRowClick = (row: IRole) => {
        navigate(`${ROUTE.STAFF_ROLE_MANAGEMENT}/${row.slug}`)
    }

    return (
        <div className="grid grid-cols-1 gap-2">
            <Helmet>
                <meta charSet='utf-8' />
                <title>
                    {tHelmet('helmet.role.title')}
                </title>
                <meta name='description' content={tHelmet('helmet.role.title')} />
            </Helmet>
            <span className="flex gap-1 items-center text-lg">
                <SquareMenu />
                {t('role.title')}
            </span>
            <DataTable
                columns={useRoleListColumns()}
                data={data?.result || []}
                isLoading={isLoading}
                pages={1}
                // filterOptions={EmployeeFilterOptions}
                // actionOptions={EmployeesAction}
                onPageChange={() => { }}
                onPageSizeChange={() => { }}
                onRowClick={handleRowClick}
            // actionOptions={CreateRoleDialog}
            />
        </div>
    )
}
