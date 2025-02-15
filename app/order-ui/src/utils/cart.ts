import moment from 'moment'
import { useCartItemStore } from '@/stores'

export const setupAutoClearCart = () => {
  const { clearCart, getCartItems } = useCartItemStore.getState()
  const cartItems = getCartItems()

  if (cartItems) {
    // Check if cart should be cleared
    const expirationTime = localStorage.getItem('cartExpirationTime')
    if (expirationTime && moment().valueOf() > parseInt(expirationTime)) {
      clearCart()
      localStorage.removeItem('cartExpirationTime')
      return
    }

    // Set new expiration time if not exists
    if (!expirationTime) {
      const tomorrow = moment().add(1, 'day').startOf('day')
      localStorage.setItem('cartExpirationTime', tomorrow.valueOf().toString())
    }

    // Set timeout for current session
    const timeUntilExpiration = parseInt(expirationTime!) - moment().valueOf()
    if (timeUntilExpiration > 0) {
      setTimeout(() => {
        clearCart()
        localStorage.removeItem('cartExpirationTime')
      }, timeUntilExpiration)
    }
  }
}
