import _ from 'lodash'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactSelect, { SingleValue } from 'react-select'

import { OrderTypeEnum } from '@/types'
import { useOrderTypeStore, useThemeStore } from '@/stores'

interface OrderTypeSelectProps {
  typeOrder?: string
}

export default function OrderTypeSelect({ typeOrder }: OrderTypeSelectProps) {
  const { getTheme } = useThemeStore()
  const { t } = useTranslation('menu')
  const { orderType, addOrderType } = useOrderTypeStore()
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

  const handleChange = (
    selectedOption: SingleValue<{ value: string; label: string }>,
  ) => {
    if (selectedOption) {
      addOrderType(selectedOption.value as OrderTypeEnum)
      // if (onChange) {
      //   onChange(selectedOption.value)
      // }
    }
  }
  return (
    <ReactSelect
      isSearchable={false}
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
      value={orderTypes.find((type) => type.value === (orderType || typeOrder))}
      options={orderTypes}
      onChange={handleChange}
    />
  )
}
