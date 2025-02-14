import _ from 'lodash'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactSelect, { SingleValue } from 'react-select'

import { IOrder, OrderTypeEnum } from '@/types'
import { useThemeStore } from '@/stores'

interface OrderTypeSelectProps {
  orderItems?: IOrder | null
  onChange?: (orderType: string) => void
}

export default function OrderTypeSelect({ orderItems, onChange }: OrderTypeSelectProps) {
  const { getTheme } = useThemeStore()
  const { t } = useTranslation('menu')

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
  } | null>(() => {
    if (orderItems?.type) {
      return orderTypes.find((type) => type.value === orderItems.type) || null
    }
    if (orderItems?.type) {
      return orderTypes.find((type) => type.value === orderItems.type) || null
    }
    return null
  })

  useEffect(() => {
    if (orderItems?.type) {
      const result = orderTypes.find((type) => type.value === orderItems.type)
      if (result) {
        setSelectedType(result)
      }
    }
  }, [orderItems, orderTypes])

  const handleChange = (
    selectedOption: SingleValue<{ value: string; label: string }>,
  ) => {
    if (selectedOption) {
      if (onChange) {
        onChange(selectedOption.value)
      }
      if (selectedOption && selectedOption.value === OrderTypeEnum.TAKE_OUT) {
        if (onChange) {
          onChange(selectedOption.value)
        }
      }
    }
  }

  return (
    <ReactSelect
      placeholder={t('menu.selectOrderType')}
      className="w-full text-sm border-muted-foreground text-muted-foreground"
      styles={{
        control: (baseStyles) => ({
          ...baseStyles,
          backgroundColor: getTheme() === 'light' ? 'white' : 'black',
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
