// import _ from 'lodash'
// import { useState } from 'react'
// import { useTranslation } from 'react-i18next'
// import ReactSelect, { SingleValue } from 'react-select'

// import { OrderTypeEnum } from '@/types'
// import { useThemeStore, useUpdateOrderStore } from '@/stores'

// interface OrderTypeSelectProps {
//   typeOrder?: string
// }

// export default function OrderTypeSelect({ typeOrder }: OrderTypeSelectProps) {
//   const { getTheme } = useThemeStore()
//   const { t } = useTranslation('menu')
//   const { orderItems, addOrderType, removeTable } = useUpdateOrderStore()
//   const [orderTypes] = useState<{ value: string; label: string }[]>(() => {
//     return [
//       {
//         value: OrderTypeEnum.AT_TABLE,
//         label: t('menu.dineIn'),
//       },
//       {
//         value: OrderTypeEnum.TAKE_OUT,
//         label: t('menu.takeAway'),
//       },
//     ]
//   })

//   const handleChange = (
//     selectedOption: SingleValue<{ value: string; label: string }>,
//   ) => {
//     if (selectedOption) {
//       if (selectedOption.value === OrderTypeEnum.TAKE_OUT) {
//         removeTable()
//       }
//       addOrderType(selectedOption.value as OrderTypeEnum)
//       // if (onChange) {
//       //   onChange(selectedOption.value)
//       // }
//     }
//   }
//   return (
//     <ReactSelect
//       isSearchable={false}
//       placeholder={t('menu.selectOrderType')}
//       // className="w-full pr-4 text-sm border-muted-foreground text-muted-foreground"
//       styles={{
//         control: (baseStyles) => ({
//           ...baseStyles,
//           backgroundColor: getTheme() === 'light' ? 'white z-50' : 'black',
//           borderColor: getTheme() === 'light' ? '#e2e8f0' : '#2d2d2d',
//         }),
//         menu: (baseStyles) => ({
//           ...baseStyles,
//           backgroundColor: getTheme() === 'light' ? 'white' : '#121212',
//         }),
//         option: (baseStyles, state) => ({
//           ...baseStyles,
//           backgroundColor: state.isFocused
//             ? getTheme() === 'light'
//               ? '#e2e8f0'
//               : '#2d2d2d'
//             : getTheme() === 'light'
//               ? 'white'
//               : '#121212',
//           color: getTheme() === 'light' ? 'black' : 'white',
//           '&:hover': {
//             backgroundColor: getTheme() === 'light' ? '#e2e8f0' : '#2d2d2d',
//           },
//         }),
//         singleValue: (baseStyles) => ({
//           ...baseStyles,
//           color: getTheme() === 'light' ? 'black' : 'white',
//         }),
//       }}
//       value={orderTypes.find((type) => type.value === (orderItems?.type || typeOrder))}
//       options={orderTypes}
//       onChange={handleChange}
//     />
//   )
// }

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { OrderTypeEnum } from '@/types'
import { useOrderFlowStore, useThemeStore } from '@/stores'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface OrderTypeSelectProps {
  typeOrder?: string
}

export default function OrderTypeSelect({ typeOrder }: OrderTypeSelectProps) {
  const { t } = useTranslation('menu')
  const { getTheme } = useThemeStore()
  const { updatingData, setDraftType } = useOrderFlowStore()

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

  const selectedValue = updatingData?.updateDraft?.type || typeOrder || ''

  const handleChange = (value: OrderTypeEnum) => {
    setDraftType(value as OrderTypeEnum)
  }

  return (
    <Select value={selectedValue} onValueChange={handleChange}>
      <SelectTrigger className="w-full">
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

