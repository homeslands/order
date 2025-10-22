import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { PenLine } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Button,
  ScrollArea,
  SheetFooter,
  DataTable,
} from '@/components/ui'
import { IVoucher } from '@/types'
import { useUserGroups } from '@/hooks'
import { useUserGroupColumns } from '@/app/system/voucher/DataTable/columns'
import { ConfirmApplyVoucherForUserGroupDialog } from '@/components/app/dialog'

interface IApplyVoucherForUserGroupSheetProps {
  voucher: IVoucher
}

export default function ApplyVoucherForUserGroupSheet({
  voucher,
}: IApplyVoucherForUserGroupSheetProps) {
  const { t } = useTranslation(['voucher'])
  const { t: tCommon } = useTranslation(['common'])
  const [isOpen, setIsOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedUserGroups, setSelectedUserGroups] = useState<string[]>([])

  // Separate pagination state for sheet
  const [sheetPagination, setSheetPagination] = useState({
    pageIndex: 1,
    pageSize: 10
  })

  const { data: userGroupsData, isLoading } = useUserGroups({
    voucher: voucher?.slug,
    isAppliedVoucher: false,
    page: sheetPagination.pageIndex,
    size: sheetPagination.pageSize,
    hasPaging: true,
  }, !!sheetOpen)

  const userGroups = userGroupsData?.result.items
  const userGroupsTotalPages = userGroupsData?.result.totalPages

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSheetOpen(true)
  }, [])

  const handleSelectionChange = useCallback((selectedSlugs: string[]) => {
    setSelectedUserGroups(selectedSlugs)
  }, [])

  const handleSheetPageChange = useCallback((page: number) => {
    setSheetPagination(prev => ({
      ...prev,
      pageIndex: page
    }))
  }, [])

  const handleSheetPageSizeChange = useCallback((size: number) => {
    setSheetPagination(() => ({
      pageIndex: 1, // Reset to first page when changing page size
      pageSize: size
    }))
  }, [])

  const handleSheetOpenChange = useCallback((open: boolean) => {
    setSheetOpen(open)
  }, [])

  const filterConfig = [
    {
      id: 'userGroup',
      label: t('userGroup.title'),
      options: [
        { label: tCommon('dataTable.all'), value: 'all' },
        ...(userGroupsData?.result.items.map(userGroup => ({
          label: userGroup.name.charAt(0).toUpperCase() + userGroup.name.slice(1),
          value: userGroup.slug,
        })) || []),
      ],
    },
  ]

  const handleFilterChange = (filterId: string, value: string) => {
    if (filterId === 'userGroup') {
      setSelectedUserGroups(value === 'all' ? [] : [value])
    }
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="gap-1 justify-start px-2 w-full"
          onClick={handleClick}
        >
          <PenLine className="icon" />
          {t('voucher.applyVoucherForUserGroup')}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-3xl">
        <SheetHeader className="p-4">
          <SheetTitle className="text-primary">
            {t('voucher.applyVoucherForUserGroup')}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full bg-transparent backdrop-blur-md">
          <ScrollArea className="max-h-[calc(100vh-8rem)] flex-1 gap-4">
            {/* Product List */}
            <div
              className={`p-4 bg-white rounded-md border dark:bg-transparent`}
            >
              <div className="grid grid-cols-1 gap-2">
                <DataTable
                  columns={useUserGroupColumns({
                    onSelectionChange: handleSelectionChange,
                    selectedUserGroups: selectedUserGroups || [],
                  })}
                  data={userGroups || []}
                  isLoading={isLoading}
                  pages={userGroupsTotalPages || 1}
                  // filterOptions={ProductFilterOptions}
                  filterConfig={filterConfig}
                  onFilterChange={handleFilterChange}
                  onPageChange={handleSheetPageChange}
                  onPageSizeChange={handleSheetPageSizeChange}
                />
              </div>
            </div>
          </ScrollArea>
          <SheetFooter className="p-4">
            <ConfirmApplyVoucherForUserGroupDialog
              disabled={
                !selectedUserGroups || selectedUserGroups.length === 0
              }
              applyVoucherForUserGroupRequest={{
                userGroups: selectedUserGroups || [],
                vouchers: [voucher?.slug],
              }}
              voucherSlug={voucher?.slug}
              isOpen={isOpen}
              onOpenChange={setIsOpen}
              onCloseSheet={() => setSheetOpen(false)}
            />
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
