// hooks/use-sync-external-store.ts
import { useCartItemStore } from '@/stores'

export const useSyncedCartItems = () => {
  // This will automatically re-render when cartItems changes
  return useCartItemStore((state) => state.cartItems)
}
