import { CircleXIcon, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'

import { Input } from '@/components/ui'
import { useMenuFilterStore } from '@/stores'
import { useDebouncedInput } from '@/hooks'

export default function ProductNameSearch() {
  const { menuFilter, setMenuFilter } = useMenuFilterStore()
  const { t } = useTranslation('menu')

  const {
    inputValue,
    setInputValue,
    debouncedInputValue
  } = useDebouncedInput({
    defaultValue: menuFilter.productName || '',
    delay: 500
  })

  // Sau khi debounce xong thì mới lưu vào store
  useEffect(() => {
    setMenuFilter(prev => ({
      ...prev,
      productName: debouncedInputValue || undefined
    }))
  }, [debouncedInputValue, setMenuFilter])

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder={t('menu.searchProduct')}
        className="pr-10 pl-10 w-full bg-white dark:bg-transparent"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      {inputValue && (
        <CircleXIcon
          className="absolute right-3 top-1/2 w-4 h-4 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-primary"
          onClick={() => setInputValue('')}
        />
      )}
    </div>
  )
}
