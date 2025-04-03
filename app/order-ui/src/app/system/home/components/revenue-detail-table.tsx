import { Card, CardContent, CardHeader, CardTitle, DataTable } from "@/components/ui"
import { useBranchRevenue } from "@/hooks"
import { useRevenueListColumns } from "./DataTable/revenue-column"
import { RevenueTypeQuery } from "@/constants"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { IBranchRevenue } from "@/types"

interface RevenueTableProps {
  branch: string
}

export default function RevenueTable({ branch }: RevenueTableProps) {
  const { t } = useTranslation('revenue')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const { data: revenueData, refetch, isLoading } = useBranchRevenue({
    branch,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    type: RevenueTypeQuery.DAILY,
  })
  const revenueList = (revenueData?.result || []).filter(item => item.totalOrder !== 0)

  useEffect(() => {
    refetch()
    setPage(1)
  }, [startDate, endDate, branch, refetch])

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
    <Card className='shadow-none mt-4'>
      <CardHeader >
        <CardTitle className='flex items-center justify-between'>
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
          hiddenDatePicker={false}
          periodOfTime="inWeek"
          onDateChange={(start, end) => {
            setStartDate(start)
            setEndDate(end)
          }}
        />
      </CardContent>
    </Card>
  )
}


