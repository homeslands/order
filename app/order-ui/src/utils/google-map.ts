import { useTranslation } from 'react-i18next'
import { useGetBranchInfoForDelivery } from '@/hooks'

export const parseKm = (distanceText?: string): number | null => {
  if (!distanceText) return null
  const num = parseFloat(distanceText.replace(/,/g, '').replace(/[^0-9.]/g, ''))
  if (Number.isNaN(num)) return null
  if (/km/i.test(distanceText)) return num
  if (/m/i.test(distanceText)) return num / 1000
  return num
}

// calculate delivery fee based on distance using branch delivery info
export const useCalculateDeliveryFee = (
  distance: number,
  branchSlug: string,
) => {
  const { t } = useTranslation('menu')
  const {
    data: branchInfo,
    isLoading,
    error,
  } = useGetBranchInfoForDelivery(branchSlug)

  if (isLoading) {
    return { deliveryFee: 0, isLoading: true, error: null }
  }

  if (error) {
    return { deliveryFee: 0, isLoading: false, error }
  }

  if (!branchInfo?.result) {
    return {
      deliveryFee: 0,
      isLoading: false,
      error: new Error('Branch info not found'),
    }
  }

  const { maxDistanceDelivery, deliveryFeePerKm } = branchInfo.result

  if (distance > maxDistanceDelivery) {
    return {
      deliveryFee: 0,
      isLoading: false,
      error: new Error(t('cart.deliveryAddressNote')),
    }
  }

  const deliveryFee = distance * deliveryFeePerKm
  return { deliveryFee, isLoading: false, error: null }
}

// get max distance and fee per km from branch delivery info
export const useGetBranchDeliveryConfig = (branchSlug: string) => {
  const {
    data: branchInfo,
    isLoading,
    error,
  } = useGetBranchInfoForDelivery(branchSlug)

  if (isLoading) {
    return { maxDistance: 0, feePerKm: 0, isLoading: true, error: null }
  }

  if (error) {
    return { maxDistance: 0, feePerKm: 0, isLoading: false, error }
  }

  if (!branchInfo?.result) {
    return {
      maxDistance: 0,
      feePerKm: 0,
      isLoading: false,
      error: new Error('Branch info not found'),
    }
  }

  const { maxDistanceDelivery, deliveryFeePerKm } = branchInfo.result

  return {
    maxDistance: maxDistanceDelivery,
    feePerKm: deliveryFeePerKm,
    isLoading: false,
    error: null,
  }
}
