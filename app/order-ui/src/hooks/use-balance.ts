import { useQuery } from '@tanstack/react-query'
import { getUserBalance } from '@/api'

export function useGetUserBalance(slug?: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['userBalance', slug],
    queryFn: () => getUserBalance(slug),
    enabled,
  })
}
