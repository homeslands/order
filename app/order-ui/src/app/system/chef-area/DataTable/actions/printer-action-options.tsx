import { FC } from 'react'

import { IPrinterForChefArea } from '@/types'
import { DataTableActionOptionsProps } from '@/components/ui'
import { CreatePrinterSheet } from '@/components/app/sheet'

export default function PrinterActionOptions(): FC<DataTableActionOptionsProps<IPrinterForChefArea>> {
  return function ActionOptions() {
    return (
      <>
        <CreatePrinterSheet />
      </>
    )
  }
}