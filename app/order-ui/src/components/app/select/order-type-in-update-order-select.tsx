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
//       // className="pr-4 w-full text-sm border-muted-foreground text-muted-foreground"
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
import { useOrderFlowStore, useThemeStore, useUserStore } from '@/stores'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Role, SystemLockFeatureGroup, SystemLockFeatureType, SystemLockFeatureChild } from '@/constants'
import { useGetSystemFeatureFlagsByGroup } from '@/hooks'

interface OrderTypeSelectProps {
  typeOrder?: string
}

export default function OrderTypeSelect({ typeOrder }: OrderTypeSelectProps) {
  const { t } = useTranslation('menu')
  const { userInfo } = useUserStore()
  const { getTheme } = useThemeStore()
  const { updatingData, setDraftType } = useOrderFlowStore()
  const { data: featuresSystemFlagsResponse } = useGetSystemFeatureFlagsByGroup(
    SystemLockFeatureGroup.ORDER,
  )

  // Check if user is logged in (either real user or update draft owner is logged in customer)
  const isUserLoggedIn = useMemo(() => {
    // User có slug và role là CUSTOMER
    const isUserAuthenticated = userInfo?.slug && userInfo?.role.name === Role.CUSTOMER
    // Hoặc update draft owner là customer đã đăng nhập
    const isOwnerLoggedInAndRoleCustomer = updatingData?.updateDraft?.ownerRole === Role.CUSTOMER && updatingData?.updateDraft?.ownerPhoneNumber !== 'default-customer'
    return isUserAuthenticated || isOwnerLoggedInAndRoleCustomer
  }, [userInfo?.slug, userInfo?.role.name, updatingData?.updateDraft?.ownerRole, updatingData?.updateDraft?.ownerPhoneNumber])

  // Wrap featureFlags in useMemo to avoid changing dependencies
  const featureFlags = useMemo(
    () => featuresSystemFlagsResponse?.result || [],
    [featuresSystemFlagsResponse?.result]
  )

  // Lấy parent feature phù hợp với trạng thái logged in
  const relevantParentFeature = useMemo(() => {
    if (isUserLoggedIn) {
      // User đã đăng nhập → lấy CREATE_PRIVATE
      return featureFlags.find((parent) => parent.name === SystemLockFeatureType.CREATE_PRIVATE)

    } else {
      // User chưa đăng nhập → lấy CREATE_PUBLIC
      return featureFlags.find((parent) => parent.name === SystemLockFeatureType.CREATE_PUBLIC)
    }
  }, [featureFlags, isUserLoggedIn])

  // Map children với order types để check trạng thái locked (chỉ từ parent phù hợp)
  const orderTypeLockStatus = useMemo(() => {
    const status: Record<string, boolean> = {}
    const children = relevantParentFeature?.children || []

    children.forEach((child) => {
      status[child.name] = child.isLocked
    })

    return status
  }, [relevantParentFeature])

  const orderTypes = useMemo(
    () => {
      // Map OrderTypeEnum values to SystemLockFeatureChild keys
      const orderTypeToFeatureMap: Record<string, string> = {
        [OrderTypeEnum.AT_TABLE]: SystemLockFeatureChild.AT_TABLE,
        [OrderTypeEnum.TAKE_OUT]: SystemLockFeatureChild.TAKE_OUT,
        [OrderTypeEnum.DELIVERY]: SystemLockFeatureChild.DELIVERY,
      }

      const allTypes = [
        {
          value: OrderTypeEnum.AT_TABLE,
          label: t('menu.dineIn'),
        },
        {
          value: OrderTypeEnum.TAKE_OUT,
          label: t('menu.takeAway'),
        },
      ]

      // Check if DELIVERY exists in relevant parent's children
      const hasDeliveryInFeature = relevantParentFeature?.children?.some(
        (child) => child.name === SystemLockFeatureChild.DELIVERY
      )

      // Only add delivery option if:
      // 1. User is logged in (isUserLoggedIn)
      // 2. DELIVERY exists in the relevant parent feature (CREATE_PRIVATE has DELIVERY, CREATE_PUBLIC doesn't)
      if (isUserLoggedIn && hasDeliveryInFeature) {
        allTypes.push({
          value: OrderTypeEnum.DELIVERY,
          label: t('menu.delivery'),
        })
      }

      // Lọc bỏ các order type bị locked (isLocked = true)
      // Map từ OrderTypeEnum value ('at-table') sang SystemLockFeatureChild key ('AT_TABLE')
      const availableTypes = allTypes.filter((type) => {
        const featureKey = orderTypeToFeatureMap[type.value]
        const isLocked = orderTypeLockStatus[featureKey] === true
        return !isLocked
      })

      return availableTypes
    },
    [t, isUserLoggedIn, orderTypeLockStatus, relevantParentFeature]
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

