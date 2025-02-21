import { useCartItemStore, useThemeStore } from '@/stores'
import { OrderTypeEnum } from '@/types'
import _ from 'lodash'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactSelect, { SingleValue } from 'react-select'

export default function OrderTypeSelect() {
  const { getTheme } = useThemeStore()
  const { t } = useTranslation('menu')
  const { addOrderType, removeTable, getCartItems } = useCartItemStore()
  const [orderTypes] = useState<{ value: string; label: string }[]>(() => {
    return [
      {
        value: OrderTypeEnum.AT_TABLE,
        label: t('menu.dineIn'),
      },
      {
        value: OrderTypeEnum.TAKE_OUT,
        label: t('menu.takeAway'),
      },
    ]
  })
  const [selectedType, setSelectedType] = useState<{
    value: string
    label: string
  } | null>(null)

  useEffect(() => {
    const cartItems = getCartItems()
    if (cartItems?.type) {
      const result = orderTypes.find((type) => type.value === cartItems.type)
      if (result) {
        setSelectedType(result)
      }
    }
  }, [getCartItems, orderTypes])

  const handleChange = (
    selectedOption: SingleValue<{ value: string; label: string }>,
  ) => {
    if (selectedOption) {
      setSelectedType(selectedOption)
      if (selectedOption.value === OrderTypeEnum.TAKE_OUT) {
        removeTable()
      }
      addOrderType(selectedOption.value as OrderTypeEnum)
    }
  }

  return (
    <ReactSelect
      placeholder={t('menu.selectOrderType')}
      className="w-full text-sm border-muted-foreground text-muted-foreground"
      styles={{
        control: (baseStyles) => ({
          ...baseStyles,
          backgroundColor: getTheme() === 'light' ? 'white' : '',
          borderColor: getTheme() === 'light' ? '#e2e8f0' : '#2d2d2d',
        }),
        menu: (baseStyles) => ({
          ...baseStyles,
          backgroundColor: getTheme() === 'light' ? 'white' : '#121212',
        }),
        option: (baseStyles, state) => ({
          ...baseStyles,
          backgroundColor: state.isFocused
            ? getTheme() === 'light'
              ? '#e2e8f0'
              : '#2d2d2d'
            : getTheme() === 'light'
              ? 'white'
              : '#121212',
          color: getTheme() === 'light' ? 'black' : 'white',
          '&:hover': {
            backgroundColor: getTheme() === 'light' ? '#e2e8f0' : '#2d2d2d',
          },
        }),
        singleValue: (baseStyles) => ({
          ...baseStyles,
          color: getTheme() === 'light' ? 'black' : 'white',
        }),
      }}
      value={selectedType}
      options={orderTypes}
      onChange={handleChange}
    />
  )
}