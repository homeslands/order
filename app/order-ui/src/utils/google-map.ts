import { DELIVERY_FEE, GOOGLE_MAP_DISTANCE_LIMIT } from '@/constants'
import { useTranslation } from 'react-i18next'

export const parseKm = (distanceText?: string): number | null => {
  if (!distanceText) return null
  const num = parseFloat(distanceText.replace(/,/g, '').replace(/[^0-9.]/g, ''))
  if (Number.isNaN(num)) return null
  if (/km/i.test(distanceText)) return num
  if (/m/i.test(distanceText)) return num / 1000
  return num
}

// calculate delivery fee based on distance
export const useCalculateDeliveryFee = (distance: number): number => {
  const { t } = useTranslation('menu')
  if (distance > GOOGLE_MAP_DISTANCE_LIMIT) {
    throw new Error(t('cart.deliveryAddressNote'))
  }
  return distance * DELIVERY_FEE
}
