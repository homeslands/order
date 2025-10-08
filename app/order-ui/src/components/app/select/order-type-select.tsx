import { useEffect, useMemo } from 'react'
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
import { Role, SystemLockFeatureChild, SystemLockFeatureGroup, SystemLockFeatureType } from '@/constants'
import { useGetSystemFeatureFlagsByGroup } from '@/hooks'

export default function OrderTypeSelect() {
  const { t } = useTranslation('menu')
  const { getTheme } = useThemeStore()
  const { setOrderingType, getCartItems } = useOrderFlowStore()
  const { data: featuresSystemFlagsResponse } = useGetSystemFeatureFlagsByGroup(
    SystemLockFeatureGroup.ORDER,
  )

  const cartItems = getCartItems()

  // Check if user is logged in (either real user or cart owner is logged in customer)
  const isUserLoggedIn = useMemo(() => {
    // User có slug và role là CUSTOMER
    const isOwnerLoggedInAndRoleCustomer = cartItems?.ownerRole === Role.CUSTOMER && cartItems?.ownerPhoneNumber !== 'default-customer'
    // Hoặc cart owner là customer đã đăng nhập
    return isOwnerLoggedInAndRoleCustomer || isOwnerLoggedInAndRoleCustomer
  }, [cartItems?.ownerRole, cartItems?.ownerPhoneNumber])

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
      // console.log(`Processing child: ${child.name}, isLocked: ${child.isLocked}`)
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

  const selectedType = useMemo(() => {
    if (cartItems?.type) {
      const currentType = orderTypes.find((type) => type.value === cartItems.type)
      // Nếu type hiện tại không còn available (đã bị filter), chọn type đầu tiên
      if (!currentType) {
        return orderTypes[0]
      }
      return currentType
    }
    // Chọn type đầu tiên có sẵn
    return orderTypes[0]
  }, [cartItems, orderTypes])

  // Auto switch to available order type if current type is locked or not available
  useEffect(() => {
    const currentType = orderTypes.find((type) => type.value === cartItems?.type)

    // Nếu type hiện tại không tồn tại trong danh sách available types
    if (!currentType && orderTypes.length > 0) {
      setOrderingType(orderTypes[0].value as OrderTypeEnum)
    }
  }, [orderTypes, cartItems?.type, setOrderingType])

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
          <SelectItem
            key={type.value}
            value={type.value}
          >
            {type.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}