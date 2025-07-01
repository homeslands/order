import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'

import { showToast, showErrorToastMessage } from '@/utils'
import { useBranch } from '@/hooks'
import { useBranchStore } from '@/stores'

export default function ChooseBranchDialog() {
  const { t } = useTranslation(['branch'])
  const { data: branchRes } = useBranch()
  const { branch, setBranch } = useBranchStore()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState(branch?.slug || '')

  const handleSelectChange = (value: string) => {
    setSelectedBranch(value)
    const b = branchRes?.result.find((item) => item.slug === value)
    setBranch(b)
  }

  const handleConfirm = () => {
    if (selectedBranch) {
      
      setIsOpen(false)
      showToast('Đã chọn chi nhánh thành công')
    } else {
      showErrorToastMessage('Vui lòng chọn chi nhánh')
    }
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      if (!selectedBranch) {
        showErrorToastMessage('Vui lòng chọn chi nhánh')
        return
      }
      showErrorToastMessage('Vui lòng  chọn chi nhánh')
      return
    }
    setIsOpen(open)
  }

  useEffect(() => {
    if (!branch) {
      const timer = setTimeout(() => {
        setIsOpen(true)
       
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [branch])

  if (branch && !isOpen) return null

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleDialogClose}
    >
      <DialogContent className="max-w-[20rem] rounded-md px-4 sm:max-w-[36rem]">
        <DialogHeader>
          <DialogTitle>{t('branch.chooseBranch')}</DialogTitle>
        </DialogHeader>
        
        <Select value={selectedBranch} onValueChange={handleSelectChange}>
          <SelectTrigger className="w-full h-8">
            <SelectValue
              className="text-xs"
              placeholder={t('branch.chooseBranch')}
            />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {branchRes?.result.map((item) => {
              return (
                <SelectItem
                  value={item.slug}
                  key={item.slug}
                  className="truncate"
                >
                  <span
                    className="block text-xs max-w-[16rem] sm:max-w-full truncate"
                    title={item.address}
                  >
                    {item.address}
                  </span>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        <Button
          onClick={handleConfirm}
          disabled={!selectedBranch}
          className="w-full"
        >
          <span className="block truncate">Xác nhận chọn chi nhánh</span>
        </Button>
      </DialogContent>
    </Dialog>
  )
}
