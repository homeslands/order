import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
} from '@/components/ui'
import { CreateOrderTrackingByRobotForm } from '@/components/app/form'
import { ButtonLoading } from '../loading'

interface ICreateOrderTrackingByRobotDialogProps {
  onSuccess?: () => void
  disabled?: boolean
}

export default function CreateOrderTrackingByRobotDialog({
  onSuccess,
  disabled
}: ICreateOrderTrackingByRobotDialogProps) {
  const { t } = useTranslation(['menu'])
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false) // Quản lý trạng thái pending

  const handleClose = (shouldRefetch: boolean) => {
    setIsOpen(false)
    if (shouldRefetch && onSuccess) {
      onSuccess()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="flex justify-start" asChild>
        <Button
          className="gap-1"
          onClick={() => setIsOpen(true)}
          disabled={isPending || disabled} // Disable button khi pending
        >
          {isPending
            ? <ButtonLoading />
            : t('order.createOrderTrackingByRobot')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[22rem] overflow-hidden rounded-lg transition-all duration-300 hover:overflow-y-auto sm:max-h-[32rem] sm:max-w-[28rem]">
        <DialogHeader>
          <DialogTitle className="text-md sm:text-lg">
            {t('order.confirmOrderTrackingByRobot')}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-md">
            {t('order.createOrderTrackingByRobotDescription')}
          </DialogDescription>
        </DialogHeader>
        <CreateOrderTrackingByRobotForm
          onPending={setIsPending} // Truyền hàm để cập nhật trạng thái pending
          onSubmit={handleClose}
        />
      </DialogContent>
    </Dialog>
  )
}
