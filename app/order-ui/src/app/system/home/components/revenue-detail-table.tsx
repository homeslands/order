import { useState } from "react"
import { useTranslation } from "react-i18next"

import { Card, CardContent, CardHeader, CardTitle, DataTable } from "@/components/ui"
import { useRevenueListColumns } from "./DataTable/revenue-column"
import { IBranchRevenue } from "@/types"

export default function RevenueTable({ revenueData, isLoading }: { revenueData: IBranchRevenue[] | undefined, isLoading: boolean }) {
  const { t } = useTranslation('revenue')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const revenueList = (revenueData || []).filter(item => item.totalOrder !== 0)

  const getPaginatedData = (data: IBranchRevenue[], page: number, pageSize: number) => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  };

  const paginatedData = getPaginatedData(revenueList, page, pageSize);

  // Thêm hàm này để kiểm tra giới hạn
  const isPageValid = (page: number, pageSize: number, totalItems: number) => {
    const totalPages = Math.ceil(totalItems / pageSize);
    return page >= 1 && page <= totalPages;
  };

  const onPageChange = (newPage: number) => {
    if (isPageValid(newPage, pageSize, revenueList.length)) {
      setPage(newPage);
    }
  };

  const onPageSizeChange = (newPageSize: number) => {
    if (isPageValid(page, newPageSize, revenueList.length)) {
      setPageSize(newPageSize);
    }
  };

  return (
    <Card className='mt-4 shadow-none'>
      <CardHeader >
        <CardTitle className='flex justify-between items-center'>
          {t('revenue.tableRevenue')}
        </CardTitle>
      </CardHeader>
      <CardContent className='px-4'>
        <DataTable
          columns={useRevenueListColumns()}
          data={paginatedData || []}
          isLoading={isLoading}
          pages={Math.ceil(revenueList.length / pageSize)}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          hiddenDatePicker={true}
          periodOfTime="inWeek"
        />
      </CardContent>
    </Card>
  )
}


