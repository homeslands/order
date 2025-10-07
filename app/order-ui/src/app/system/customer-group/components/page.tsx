import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { SquareMenu, Users } from 'lucide-react'

import { DataTable } from '@/components/ui'
import { usePagination, useUserGroupMembers } from '@/hooks'
import { useUserGroupMemberListColumns } from '../DataTable/columns/user-group-member-columns'
import { AddUserGroupMemberSheet } from '@/components/app/sheet'

export default function UserGroupMembersPage() {
    const { t } = useTranslation(['customer'])
    const { t: tHelmet } = useTranslation('helmet')
    const { slug } = useParams()
    const [phonenumber, setPhoneNumber] = useState<string>('')
    const { handlePageChange, handlePageSizeChange, pagination } = usePagination()
    const { data: userGroupMemberListData, isLoading: isLoadingList } = useUserGroupMembers({
        userGroup: slug as string,
        page: pagination.pageIndex,
        size: pagination.pageSize,
        hasPaging: true,
        phonenumber,
    })

    const isLoading = isLoadingList
    const data = userGroupMemberListData?.result.items || []
    const totalMembers = userGroupMemberListData?.result.total || 0
    const userGroupName = userGroupMemberListData?.result.items[0]?.userGroup?.name

    return (
        <div className="flex flex-col flex-1 w-full">
            <Helmet>
                <meta charSet='utf-8' />
                <title>
                    {tHelmet('helmet.userGroup.title')}
                </title>
                <meta name='description' content={tHelmet('helmet.userGroup.title')} />
            </Helmet>
            <div className="flex justify-between items-center mb-4">
                <span className="flex gap-1 items-center text-lg">
                    <SquareMenu />
                    {t('customer.userGroup.userGroupMemberTitle')}
                </span>
                <AddUserGroupMemberSheet />
            </div>

            {/* User Group Info Card */}
            <div className="p-4 mb-6 bg-gradient-to-r rounded-lg border shadow-sm to-primary/5 from-primary/10 border-primary/20">
                <div className="flex justify-between items-center">
                    <div className="flex gap-3 items-center">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                {userGroupName || t('customer.userGroup.userGroupName')}
                            </h2>
                            <p className="text-sm text-gray-600">
                                {t('customer.userGroup.userGroupMemberTitle')}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                            {totalMembers}
                        </div>
                        <div className="text-sm text-gray-500">
                            {t('customer.userGroup.totalMembers')}
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-2 mt-4 h-full">
                <DataTable
                    columns={useUserGroupMemberListColumns()}
                    data={data}
                    isLoading={isLoading}
                    pages={userGroupMemberListData?.result.totalPages || 1}
                    hiddenInput={false}
                    searchPlaceholder={t('customer.userGroup.searchByPhoneNumber')}
                    onInputChange={setPhoneNumber}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            </div>
        </div>
    )
}
