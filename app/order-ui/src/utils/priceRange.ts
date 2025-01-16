import { IProductVariant } from '@/types'

export const getPriceRange = (
  variants: IProductVariant[],
  formatCurrency: (value: number, currency?: string) => string,
) => {
  if (!variants || variants.length === 0) return 'N/A'
  const prices = variants.map((variant) => variant.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  return minPrice === maxPrice
    ? `${formatCurrency(minPrice)}`
    : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`
}
