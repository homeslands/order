import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PlusCircle } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  Button,
  ScrollArea,
  SheetTitle,
  DataTable,
  SheetFooter,
} from '@/components/ui'
import { useUsers } from '@/hooks'
import { AddMultipleUsersToUserGroupDialog } from '../dialog'
import { IUserInfo } from '@/types'
import { useUserListColumns } from '@/app/system/customer-group/DataTable/columns'

export default function AddUserGroupMemberSheet() {
  const { t } = useTranslation('customer')
  const { t: tCommon } = useTranslation('common')

  // Independent pagination state for sheet
  const [sheetPagination, setSheetPagination] = useState({
    pageIndex: 1,
    pageSize: 10
  })

  const [isOpen, setIsOpen] = useState(false)
  const [phonenumber, setPhoneNumber] = useState<string>('')
  const [selectedUsers, setSelectedUsers] = useState<IUserInfo[]>([])
  const [, setUserMapping] = useState<Map<string, IUserInfo>>(new Map())

  // Sheet pagination handlers
  const handleSheetPageChange = (pageIndex: number) => {
    setSheetPagination(prev => ({ ...prev, pageIndex }))
  }

  const handleSheetPageSizeChange = (pageSize: number) => {
    setSheetPagination(prev => ({ ...prev, pageSize, pageIndex: 1 }))
  }


  const { data: users, isLoading, refetch } = useUsers({
    page: sheetPagination.pageIndex,
    size: sheetPagination.pageSize,
    order: 'DESC',
    hasPaging: true,
    phonenumber: phonenumber,
  }, !!isOpen)

  const handleSelectionChange = useCallback((selectedSlugs: IUserInfo[]) => {
    setSelectedUsers(selectedSlugs)
  }, [])


  const handleSubmitSuccess = (isDialogOpen: boolean) => {
    if (!isDialogOpen) {
      // Đóng sheet khi dialog đóng
      setIsOpen(false)
      refetch()
      setSelectedUsers([])
      setUserMapping(new Map())
    }
  }

  const handleSheetOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      // Reset states khi đóng sheet
      setSelectedUsers([])
      setUserMapping(new Map())
      setPhoneNumber('')
      setSheetPagination({ pageIndex: 1, pageSize: 10 })
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleSheetOpenChange}>
      <SheetTrigger asChild className="w-full">
        <Button className="z-50 w-fit">
          <PlusCircle className="icon" />
          {t('customer.userGroup.addMember')}
        </Button>
      </SheetTrigger>

      <SheetContent className="flex flex-col w-3/4 sm:max-w-3xl">
        <SheetHeader className="p-4 shrink-0">
          <SheetTitle className="text-primary">
            {t('customer.userGroup.addMember')}
          </SheetTitle>
        </SheetHeader>

        {/* ✅ ScrollArea wrapper: grow để lấp đầy chiều cao còn lại */}
        <div className="overflow-hidden flex-1">
          <ScrollArea className="h-full">
            <div className="grid grid-cols-1 gap-2 p-4">
              <DataTable
                columns={useUserListColumns(handleSelectionChange, selectedUsers)}
                data={users?.result.items || []}
                isLoading={isLoading}
                hiddenInput={false}
                onInputChange={setPhoneNumber}
                searchPlaceholder={t('customer.userGroup.searchByPhoneNumber')}
                pages={users?.result.totalPages || 1}
                onPageChange={handleSheetPageChange}
                onPageSizeChange={handleSheetPageSizeChange}
              />
            </div>
          </ScrollArea>
        </div>

        {/* Footer cố định ở đáy */}
        <SheetFooter className="p-4 shrink-0">
          {users?.result.items?.length && users?.result.items?.length > 0 && (
            <div className="flex gap-2 justify-end w-full">
              <Button
                variant="outline"
                className="h-10"
                onClick={() => {
                  setSelectedUsers([])
                  setUserMapping(new Map())
                }}
              >
                {tCommon('common.cancel')}
              </Button>
              <AddMultipleUsersToUserGroupDialog disabled={selectedUsers.length === 0} onSubmit={handleSubmitSuccess} users={selectedUsers} />
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>

  )
}
