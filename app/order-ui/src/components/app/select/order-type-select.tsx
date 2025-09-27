import { useEffect, useMemo } from 'react'
import _ from 'lodash'
import { useTranslation } from 'react-i18next'

import { useOrderFlowStore, useThemeStore, useUserStore } from '@/stores'
import { OrderTypeEnum } from '@/types'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { Role } from '@/constants'

export default function OrderTypeSelect() {
  const { t } = useTranslation('menu')
  const { userInfo } = useUserStore()
  const { getTheme } = useThemeStore()
  const { setOrderingType, getCartItems } = useOrderFlowStore()

  const cartItems = getCartItems()

  const orderTypes = useMemo(
    () => {
      const baseTypes = [
        {
          value: OrderTypeEnum.AT_TABLE,
          label: t('menu.dineIn'),
        },
        {
          value: OrderTypeEnum.TAKE_OUT,
          label: t('menu.takeAway'),
        },
      ]

      // Only add delivery option if user has a slug
      if ((userInfo?.slug && userInfo?.role.name === Role.CUSTOMER) || (cartItems?.ownerRole === Role.CUSTOMER && cartItems?.ownerFullName !== 'default-customer')) {
        baseTypes.push({
          value: OrderTypeEnum.DELIVERY,
          label: t('menu.delivery'),
        })
      }

      return baseTypes
    },
    [t, userInfo?.slug, userInfo?.role.name, cartItems?.ownerRole, cartItems?.ownerFullName]
  )

  const selectedType = useMemo(() => {
    return cartItems?.type ? orderTypes.find((type) => type.value === cartItems.type) : orderTypes[0]
  }, [cartItems, orderTypes])

  // If delivery is not available and currently selected, reset to first available
  useEffect(() => {
    const hasDelivery = orderTypes.some((ot) => ot.value === OrderTypeEnum.DELIVERY)
    if (!hasDelivery && cartItems?.type === OrderTypeEnum.DELIVERY) {
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
          <SelectItem key={type.value} value={type.value}>
            {type.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}