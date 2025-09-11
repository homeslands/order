import { QUERYKEY, Role } from '@/constants'
import {
  IGiftCardCreateRequest,
  IGiftCardUpdateRequest,
  IGetGiftCardsRequest,
  IGiftCardGetRequest,
  ICardOrderRequest,
  IGiftCardCartItem,
} from '@/types'
import { GiftCardUsageStatus } from '@/constants'
import { useState, useCallback, useMemo } from 'react'
import { useMutation, useQuery, useInfiniteQuery } from '@tanstack/react-query'
import {
  getGiftCards,
  getUserGiftCards,
  createGiftCard,
  updateGiftCard,
  deleteGiftCard,
  createCardOrder,
  getGiftCard,
  getCardOrder,
  cancelCardOrder,
  initiateCardOrderPayment,
  useGiftCard,
  getFeatureFlagGroups,
  getFeatureFlagsByGroup,
  bulkToggleFeatureFlags,
  getGiftCardBySlug,
  initiateCardOrderPaymentAdmin,
} from '@/api'
import { useEffect } from 'react'
import { useGiftCardStore, useUserStore } from '@/stores'
import { showToast } from '@/utils'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

export const useGetGiftCards = (params: IGetGiftCardsRequest) => {
  return useQuery({
    queryKey: [QUERYKEY.giftCards, params],
    queryFn: () => getGiftCards(params),
  })
}

export const useGetUserGiftCards = (params?: IGiftCardGetRequest) => {
  return useQuery({
    queryKey: [QUERYKEY.userGiftCards, params],
    queryFn: () => getUserGiftCards(params || {}),
  })
}

export const useGetUserGiftCardsInfinite = ({ pageSize = 10 }) => {
  const today = moment()
  const { userInfo } = useUserStore()
  const [filters, setFilters] = useState<{
    status: GiftCardUsageStatus
    fromDate: string
    toDate: string
    customerSlug: string | undefined
  }>({
    status: GiftCardUsageStatus.ALL,
    fromDate: today.startOf('month').format('YYYY-MM-DD'),
    toDate: today.endOf('month').format('YYYY-MM-DD'),
    customerSlug: userInfo?.slug,
  })

  const {
    data: giftCardsData,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['userGiftCardsInfinite', filters],
    queryFn: async ({ pageParam }) => {
      const params: IGiftCardGetRequest = {
        page: pageParam as number,
        size: pageSize,
        customerSlug: filters.customerSlug,
      }

      // Add filters
      if (filters.fromDate) params.fromDate = filters.fromDate
      if (filters.toDate) params.toDate = filters.toDate
      if (filters.status !== GiftCardUsageStatus.ALL)
        params.status = filters.status

      return getUserGiftCards(params)
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.result.hasNext ? lastPage.result.page + 1 : undefined,
  })

  // Flatten paginated gift cards
  const giftCards = useMemo(() => {
    return giftCardsData?.pages.flatMap((page) => page.result.items) || []
  }, [giftCardsData])

  // Get total count from first page
  const totalCount = giftCardsData?.pages[0]?.result.total || 0

  // Update filters
  const updateFilters = useCallback(
    (
      newFilters: Partial<{
        status: GiftCardUsageStatus
        fromDate: string
        toDate: string
      }>,
    ) => {
      setFilters((prev) => ({ ...prev, ...newFilters }))
    },
    [],
  )

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      status: GiftCardUsageStatus.ALL,
      fromDate: '',
      toDate: '',
      customerSlug: userInfo?.slug,
    })
  }, [userInfo?.slug])

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      !!filters.fromDate ||
      !!filters.toDate ||
      filters.status !== GiftCardUsageStatus.ALL
    )
  }, [filters])

  return {
    // Data
    giftCards,
    totalCount,

    // Loading states
    isLoading,
    isFetchingNextPage,
    isError,

    // Pagination
    hasNextPage,
    fetchNextPage,

    // Filters
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters,

    // Actions
    refetch,
  }
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
    meta: {
      ignoreGlobalError: true,
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
        version: query.data.result.version,
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
  const { userInfo } = useUserStore()
  const role = userInfo?.role?.name
  return useMutation({
    mutationFn: async (payload: {
      slug: string
      paymentMethod: string
      cashierSlug: string
    }) => {
      return role !== Role.CUSTOMER
        ? initiateCardOrderPaymentAdmin(
            payload.slug,
            payload.paymentMethod,
            payload.cashierSlug,
          )
        : initiateCardOrderPayment(payload.slug, payload.paymentMethod)
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
