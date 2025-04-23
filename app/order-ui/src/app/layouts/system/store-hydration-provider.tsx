// components/StoreHydrationProvider.tsx
import { useCartItemStore } from '@/stores'

export default function StoreHydrationProvider() {
    // Gọi store để Zustand tiến hành hydrate persist state từ localStorage
    useCartItemStore()
    return null
}
