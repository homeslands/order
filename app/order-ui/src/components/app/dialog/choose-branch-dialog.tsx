import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'

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

  const handleClose = () => {
    if (selectedBranch) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    // Only show dialog if no branch is selected
    if (!branch) {
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [branch])

  // Skip rendering if branch is already selected
  if (branch && !isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!selectedBranch) {
        setIsOpen(true)
        return
      }
      setIsOpen(open)
    }}>
      <DialogContent className="max-w-[20rem] rounded-md px-6 sm:max-w-[36rem]">
        <DialogHeader>
          <DialogTitle>{t('branch.chooseBranch')}</DialogTitle>
          <DialogDescription>
            {t('branch.chooseBranchDescription')}
          </DialogDescription>
        </DialogHeader>
        <Select
          value={selectedBranch}
          onValueChange={handleSelectChange}
        >
          <SelectTrigger className="w-full h-8">
            <SelectValue
              className="text-xs"
              placeholder={'Lựa chọn chi nhánh'}
            />
          </SelectTrigger>
          <SelectContent>
            {branchRes?.result.map((item) => {
              return (
                <SelectItem value={item.slug} key={item.slug}>
                  <span className="text-xs">{item.address}</span>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        <Button
          onClick={handleClose}
          disabled={!selectedBranch}
        >
          {t('branch.chooseBranch')} {branch?.address}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
