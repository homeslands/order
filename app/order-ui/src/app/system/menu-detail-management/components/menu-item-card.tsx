import { useTranslation } from 'react-i18next'

import { publicFileURL } from '@/constants'
import {
  DeleteMenuItemDialog,
  UpdateMenuItemDialog,
} from '@/components/app/dialog'
import { IMenuItem } from '@/types'
import { formatCurrency } from '@/utils'

interface MenuItemCardProps {
  menuItem: IMenuItem
}

export function MenuItemCard({ menuItem }: MenuItemCardProps) {
  const { t } = useTranslation(['menu'])

  const getPriceRange = () => {
    if (!menuItem.product.variants?.length) return null

    const prices = menuItem.product.variants.map((variant) => variant.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)

    return minPrice === maxPrice
      ? `${formatCurrency(minPrice)}`
      : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`
  }

  return (
    <div className="group relative flex flex-col items-center justify-start gap-2 rounded-xl border p-2">
      <div className="absolute inset-0 flex items-start justify-end opacity-0 transition-opacity group-hover:opacity-100">
        <div className="flex flex-row gap-2 rounded-md bg-transparent p-4">
          <UpdateMenuItemDialog menuItem={menuItem} />
          <DeleteMenuItemDialog menuItem={menuItem} />
        </div>
      </div>

      <img
        src={`${publicFileURL}/${menuItem.product.image}`}
        alt={menuItem.product.name}
        className="h-40 w-full rounded-md object-cover"
      />
      <h3 className="text-md flex w-full justify-start font-bold">
        {menuItem.product.name}
      </h3>
      <p className="flex w-full justify-start text-sm text-muted-foreground">
        {menuItem.product.description || t('menu.noDescription')}
      </p>
      <div className="mt-2 flex w-full flex-col justify-between gap-1 text-sm font-medium">
        <span>
          {t('menu.stock')} {menuItem.currentStock}/{menuItem.defaultStock}
        </span>
        {menuItem.product.variants && (
          <span className="text-primary">{getPriceRange()}</span>
        )}
      </div>
    </div>
  )
}
