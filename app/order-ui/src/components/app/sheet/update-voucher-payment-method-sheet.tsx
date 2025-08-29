import { useState, useCallback, useMemo } from 'react'
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
} from '@/components/ui'
import { IVoucherPaymentMethodDiff, IVoucher } from '@/types'
import { ConfirmUpdateVoucherPaymentMethodDialog } from '@/components/app/dialog'
import { VoucherPaymentMethodSelect } from '../select'

interface IUpdateVoucherPaymentMethodSheetProps {
  voucher: IVoucher
}

export default function UpdateVoucherPaymentMethodSheet({
  voucher,
}: IUpdateVoucherPaymentMethodSheetProps) {
  const { t } = useTranslation(['voucher'])
  const [isOpen, setIsOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>(
    voucher.voucherPaymentMethods.map((method) => method.paymentMethod)
  )

  // Original payment methods for comparison
  const originalPaymentMethods = useMemo(
    () => voucher.voucherPaymentMethods.map((method) => method.paymentMethod),
    [voucher.voucherPaymentMethods]
  )

  // Calculate diff between original and new payment methods
  const paymentMethodDiff = useMemo((): IVoucherPaymentMethodDiff => {
    const toAdd = selectedPaymentMethods.filter(
      (method) => !originalPaymentMethods.includes(method)
    )
    const toRemove = originalPaymentMethods.filter(
      (method) => !selectedPaymentMethods.includes(method)
    )

    return {
      voucher: voucher.slug,
      originalPaymentMethods,
      newPaymentMethods: selectedPaymentMethods,
      toAdd,
      toRemove,
    }
  }, [voucher.slug, originalPaymentMethods, selectedPaymentMethods])

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSheetOpen(true)
  }, [])

  const handleSelectionChange = useCallback((newSelectedPaymentMethods: string[]) => {
    setSelectedPaymentMethods(newSelectedPaymentMethods)
  }, [])

  const handleSheetOpenChange = useCallback((open: boolean) => {
    setSheetOpen(open)
  }, [])

  return (
    <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="gap-1 justify-start px-2 w-full"
          onClick={handleClick}
        >
          <PenLine className="icon" />
          {t('voucher.updatePaymentMethod')}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-3xl">
        <SheetHeader className="p-4">
          <SheetTitle className="text-primary">
            {t('voucher.updatePaymentMethod')}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full bg-transparent backdrop-blur-md">
          <ScrollArea className="max-h-[calc(100vh-8rem)] flex-1 gap-4">
            {/* Product List */}
            <div
              className={`p-4 bg-white rounded-md border dark:bg-transparent`}
            >
              <div className="grid grid-cols-1 gap-2">
                <VoucherPaymentMethodSelect
                  voucher={voucher}
                  initialValues={selectedPaymentMethods}
                  onChange={handleSelectionChange}
                />
              </div>
            </div>
          </ScrollArea>
          <SheetFooter className="p-4">
            <ConfirmUpdateVoucherPaymentMethodDialog
              disabled={paymentMethodDiff.toAdd.length === 0 && paymentMethodDiff.toRemove.length === 0}
              paymentMethodDiff={paymentMethodDiff}
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
