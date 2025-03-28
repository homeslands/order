
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'

import { DataTable } from '@/components/ui'
import { useRoles } from '@/hooks'
import { useRoleListColumns } from './DataTable/columns'

export default function RolePage() {
    const { t: tHelmet } = useTranslation('helmet')
    const { t } = useTranslation('role')
    const { data, isLoading } = useRoles()

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
            // actionOptions={CreateRoleDialog}
            />
        </div>
    )
}
