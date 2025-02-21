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
    <div className="relative flex flex-col items-center justify-start gap-2 p-2 border group rounded-xl">
      <div className="absolute inset-0 flex items-start justify-end transition-opacity opacity-0 group-hover:opacity-100">
        <div className="flex flex-row gap-2 p-4 bg-transparent rounded-md">
          <UpdateMenuItemDialog menuItem={menuItem} />
          <DeleteMenuItemDialog menuItem={menuItem} />
        </div>
      </div>

      {menuItem.product.image ? (
        <img
          src={`${publicFileURL}/${menuItem.product.image}`}
          alt={menuItem.product.name}
          className="object-cover w-full h-40 rounded-md"
        />
      ) : (
        <div className="w-full h-40 rounded-md bg-muted/50" />
      )}
      <h3 className="flex justify-start w-full font-bold text-md">
        {menuItem.product.name}
      </h3>
      <p className="flex justify-start w-full text-sm text-muted-foreground">
        {menuItem.product.description || t('menu.noDescription')}
      </p>
      <div className="flex flex-col justify-between w-full gap-1 mt-2 text-sm font-medium">
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
