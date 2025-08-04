import { useMemo } from 'react'
import _ from 'lodash'
import { useTranslation } from 'react-i18next'

import { useOrderFlowStore, useThemeStore } from '@/stores'
import { OrderTypeEnum } from '@/types'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'

export default function OrderTypeSelect() {
  const { getTheme } = useThemeStore()
  const { t } = useTranslation('menu')
  const { setOrderingType, getCartItems } = useOrderFlowStore()

  const cartItems = getCartItems()

  const orderTypes = useMemo(
    () => [
      {
        value: OrderTypeEnum.AT_TABLE,
        label: t('menu.dineIn'),
      },
      {
        value: OrderTypeEnum.TAKE_OUT,
        label: t('menu.takeAway'),
      },
    ],
    [t]
  )

  const selectedType = useMemo(() => {
    return cartItems?.type ? orderTypes.find((type) => type.value === cartItems.type) : orderTypes[0]
  }, [cartItems, orderTypes])

  const handleChange = (value: OrderTypeEnum) => {
    setOrderingType(value as OrderTypeEnum)
  }

  return (
    <Select value={selectedType?.value} onValueChange={handleChange}>
      <SelectTrigger className="w-full bg-white dark:bg-black">
        <SelectValue placeholder={t('menu.selectOrderType')} />
      </SelectTrigger>
      <SelectContent className={getTheme() === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}>
        {orderTypes.map((type) => (
          <SelectItem key={type.value} value={type.value}>
            {type.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}