export const baseURL = import.meta.env.VITE_USE_PROXY
  ? '/api/v1'
  : import.meta.env.VITE_BASE_API_URL
// export const baseURL = import.meta.env.VITE_BASE_API_URL
export const publicFileURL = import.meta.env.VITE_PUBLIC_FILE_URL
export const googleMapAPIKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY
export const orderExpirationTimeInSeconds = Number(
  import.meta.env.VITE_ORDER_EXPIRATION_TIME_SECONDS || '900',
) // Default to 15 minutes (900 seconds)
