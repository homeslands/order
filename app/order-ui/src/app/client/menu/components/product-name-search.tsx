import { Input } from '@/components/ui'
import { CircleXIcon, Search } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface IProductNameSearchProps {
  inputValue: string
  setInputValue: (value: string) => void
}

export const ProductNameSearch: React.FC<IProductNameSearchProps> = ({
  inputValue,
  setInputValue,
}) => {
  const { t } = useTranslation('menu')

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder={t('menu.searchProduct')}
        className="w-full bg-transparent pl-10 pr-10"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      {inputValue && (
        <CircleXIcon
          className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-primary"
          onClick={() => setInputValue('')}
        />
      )}
    </div>
  )
}
