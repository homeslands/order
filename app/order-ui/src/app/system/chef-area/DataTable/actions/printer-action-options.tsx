import { FC } from 'react'

import { IPrinterForCHefArea } from '@/types'
import { DataTableActionOptionsProps } from '@/components/ui'
import { CreatePrinterSheet } from '@/components/app/sheet'

export default function PrinterActionOptions(): FC<DataTableActionOptionsProps<IPrinterForCHefArea>> {
  return function ActionOptions() {
    return (
      <>
        <CreatePrinterSheet />
      </>
    )
  }
}