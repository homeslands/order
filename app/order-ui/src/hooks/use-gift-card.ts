import { QUERYKEY } from '@/constants'
import {
  IGiftCardCreateRequest,
  IGiftCardUpdateRequest,
  IGetGiftCardsRequest,
  ICardOrderRequest,
  IGiftCardCartItem,
} from '@/types'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  getGiftCards,
  createGiftCard,
  updateGiftCard,
  deleteGiftCard,
  createCardOrder,
  getCardOrder,
  cancelCardOrder,
  initiateCardOrderPayment,
  getGiftCard,
  useGiftCard,
  getFeatureFlagGroups,
  getFeatureFlagsByGroup,
  bulkToggleFeatureFlags,
  getGiftCardBySlug,
} from '@/api'
import { useEffect } from 'react'
import { useGiftCardStore } from '@/stores'
import { showToast } from '@/utils'
import { useTranslation } from 'react-i18next'

export const useGetGiftCards = (params: IGetGiftCardsRequest) => {
  return useQuery({
    queryKey: [QUERYKEY.giftCards, params],
    queryFn: () => getGiftCards(params),
  })
}

export const useCreateGiftCard = () => {
  return useMutation({
    mutationFn: async (data: IGiftCardCreateRequest) => {
      return createGiftCard(data)
    },
  })
}

export const useUpdateGiftCard = () => {
  return useMutation({
    mutationFn: async ({
      data,
      slug,
    }: {
      data: IGiftCardUpdateRequest
      slug: string
    }) => {
      return updateGiftCard(data, slug)
    },
  })
}

export const useDeleteGiftCard = () => {
  return useMutation({
    mutationFn: async (slug: string) => {
      return deleteGiftCard(slug)
    },
  })
}

export const useCreateCardOrder = () => {
  return useMutation({
    mutationFn: async (data: ICardOrderRequest) => {
      return createCardOrder(data)
    },
    meta: {
      ignoreGlobalError: true,
    },
  })
}

export const useSyncGiftCard = (
  slug: string | null,
  options: {
    enabled?: boolean
    showToastNotification?: boolean
  } = {},
) => {
  const { enabled = true } = options
  const synchronizeWithServer = useGiftCardStore(
    (state) => state.synchronizeWithServer,
  )
  const giftCardItem = useGiftCardStore((state) => state.giftCardItem)

  // Query to fetch the current gift card data from the server
  const query = useQuery({
    queryKey: [QUERYKEY.giftCards, slug, 'sync'],
    queryFn: () => (slug ? getGiftCard(slug) : Promise.resolve(null)),
    enabled: !!slug && enabled,
    // Only refetch on mount or when slug changes to avoid excessive requests
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
  })

  // Effect to synchronize data when query result changes
  useEffect(() => {
    if (query.data?.result && slug) {
      // Convert server data to cart item format
      const serverItem: IGiftCardCartItem = {
        id: query.data.result.slug, // Use slug as ID
        slug: query.data.result.slug,
        title: query.data.result.title,
        image: query.data.result.image || '',
        description: query.data.result.description || '',
        points: query.data.result.points || 0,
        price: query.data.result.price || 0,
        quantity: giftCardItem?.quantity || 1,
        isActive: query.data.result.isActive,
      }

      // Synchronize local storage with server data
      synchronizeWithServer(serverItem)
    }
  }, [query.data, slug, synchronizeWithServer, giftCardItem?.quantity])

  return {
    ...query,
    isSynchronized: query.isFetched,
  }
}

export const useGetCardOrder = (slug: string, enable: boolean = true) => {
  return useQuery({
    queryKey: [QUERYKEY.cardOrder, slug],
    queryFn: () => getCardOrder(slug),
    refetchOnWindowFocus: false,
    enabled: enable,
  })
}

export const useCancelCardOrder = () => {
  return useMutation({
    mutationFn: async (slug: string) => {
      return cancelCardOrder(slug)
    },
  })
}

export const useInitiateCardOrderPayment = () => {
  return useMutation({
    mutationFn: async (slug: string) => {
      return initiateCardOrderPayment(slug)
    },
  })
}

export const useUseGiftCard = () => {
  const { t } = useTranslation(['toast'])

  return useMutation({
    mutationFn: useGiftCard,
    onSuccess: () => {
      showToast(t('toast.giftCardUsedSuccess'))
    },
  })
}

export const useGetFeatureFlagsByGroup = (group: string) => {
  return useQuery({
    queryKey: ['feature-flags', group],
    queryFn: () => getFeatureFlagsByGroup(group),
  })
}

export const useGetFeatureFlagGroups = () => {
  return useQuery({
    queryKey: ['feature-flag-groups'],
    queryFn: getFeatureFlagGroups,
  })
}

export const useBulkToggleFeatureFlags = () => {
  return useMutation({
    mutationFn: async (updates: { slug: string; isLocked: boolean }[]) => {
      return bulkToggleFeatureFlags(updates)
    },
  })
}

export const useGetGiftCardBySlug = (slug: string, enable: boolean = true) => {
  return useQuery({
    queryKey: [QUERYKEY.giftCards, slug],
    queryFn: () => getGiftCardBySlug(slug),
    enabled: !!slug && enable,
  })
}
