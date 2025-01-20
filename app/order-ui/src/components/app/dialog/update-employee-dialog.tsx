import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PenLineIcon } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui'

import { UpdateEmployeeForm } from '@/components/app/form'
import { IUserInfo } from '@/types'

interface IUpdateEmployeeDialogProps {
  employee: IUserInfo
}

export default function UpdateEmployeeDialog({ employee }: IUpdateEmployeeDialogProps) {
  const { t } = useTranslation(['employee'])
  const [isOpen, setIsOpen] = useState(false)
  const handleSubmit = (isOpen: boolean) => {
    setIsOpen(isOpen)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild className='flex items-center justify-start w-full'>
        <Button
          variant="ghost"
          className="h-10 gap-1 px-2 text-sm"
          onClick={() => setIsOpen(true)}
        >
          <PenLineIcon className="icon" />
          {t('employee.update')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[20rem] rounded-md px-6 sm:max-w-[36rem]">
        <DialogHeader>
          <DialogTitle>{t('employee.update')}</DialogTitle>
          <DialogDescription>
            {t('employee.updateDescription')}
          </DialogDescription>
        </DialogHeader>
        <UpdateEmployeeForm employee={employee} onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  )
}
