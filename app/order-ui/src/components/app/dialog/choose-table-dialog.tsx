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

import { useTables } from '@/hooks'
import { useCartItemStore } from '@/stores'

export default function ChooseTableDialog() {
  const { t } = useTranslation(['menu'])
  const { data: tableRes } = useTables()
  const { addTable } = useCartItemStore()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState<string>('')

  const handleSelectChange = (value: string) => {
    setSelectedTable(value)
    const t = tableRes?.result.find((item) => item.slug === value)
    if (t) {
      addTable(t)
    }
  }

  const handleClose = () => {
    if (selectedTable) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    // Only show dialog if no branch is selected
    if (!selectedTable) {
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [selectedTable])

  // Skip rendering if branch is already selected
  if (selectedTable && !isOpen) return null

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!selectedTable) {
          setIsOpen(true)
          return
        }
        setIsOpen(open)
      }}
    >
      <DialogContent className="max-w-[20rem] rounded-md px-4 sm:max-w-[36rem]">
        <DialogHeader>
          <DialogTitle>{t('menu.selectTable')}</DialogTitle>
        </DialogHeader>
        <Select value={selectedTable} onValueChange={handleSelectChange}>
          <SelectTrigger className="w-full h-8">
            <SelectValue
              className="text-xs"
              placeholder={t('menu.selectTable')}
            />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {tableRes?.result.map((item) => {
              return (
                <SelectItem
                  value={item.slug}
                  key={item.slug}
                  className="truncate"
                >
                  <span
                    className="block text-xs max-w-[16rem] sm:max-w-full truncate"
                    title={item.name}
                  >
                    {item.name}
                  </span>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        <Button
          onClick={handleClose}
          disabled={!selectedTable}
          className="w-full"
        >
          <span className="block truncate">{t('menu.chooseTable')}</span>
        </Button>
      </DialogContent>
    </Dialog>
  )
}
