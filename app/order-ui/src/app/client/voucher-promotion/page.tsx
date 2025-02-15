// import { useState } from 'react'

// import { DataTable } from '@/components/ui'
// import { useUsers, usePagination, useVoucherBySlug } from '@/hooks'
// import { useUserListColumns } from './DataTable/columns'
// import { Role } from '@/constants'
// import { EmployeeFilterOptions, EmployeesAction } from './DataTable/actions'
// import { SquareMenu } from 'lucide-react'
// import { useTranslation } from 'react-i18next'
// import { useParams } from 'react-router-dom'

// export default function VoucherAndPromotionPage() {
//     const { t } = useTranslation(['voucher'])
//     const { slug } = useParams()
//     const { data: voucher } = useVoucherBySlug({ slug })

//     const voucherData = voucher?.result || {}

//     console.log(voucherData)

//     return (
//         <div className="grid grid-cols-1 gap-2 mt-4">
//             <span className="flex items-center gap-1 text-lg">
//                 <SquareMenu />
//                 {t('voucher.title')}
//             </span>
//             {/* <DataTable
//         columns={useUserListColumns()}
//         data={data?.result.items || []}
//         isLoading={isLoading}
//         pages={data?.result.totalPages || 0}
//         hiddenInput={false}
//         onInputChange={handleSearchChange}
//         filterOptions={EmployeeFilterOptions}
//         actionOptions={EmployeesAction}
//         onPageChange={handlePageChange}
//         onPageSizeChange={handlePageSizeChange}
//       /> */}
//         </div>
//     )
// }
