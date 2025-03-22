import { useTranslation } from 'react-i18next'

import { publicFileURL } from '@/constants'
import {
  DeleteMenuItemDialog,
  UpdateMenuItemDialog,
} from '@/components/app/dialog'
import { IMenuItem } from '@/types'
import { formatCurrency } from '@/utils'
import { KeyRound } from 'lucide-react'
import ProductImage from "@/assets/images/ProductImage.png"
interface MenuItemCardProps {
  menuItem: IMenuItem
  isTemplate: boolean
  onSuccess: () => void
}

export function MenuItemCard({ menuItem,isTemplate, onSuccess }: MenuItemCardProps) {
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
          <UpdateMenuItemDialog menuItem={menuItem} isTemplate={isTemplate} />
          <DeleteMenuItemDialog menuItem={menuItem} onSuccess={onSuccess} />
        </div>
      </div>
      <img
        src={menuItem?.product?.image ? `${publicFileURL}/${menuItem.product.image}` : ProductImage}
        alt={menuItem.product.name}
        className="object-cover w-full h-40 rounded-md"
      />

      <h3 className="flex justify-start w-full font-bold text-md whitespace-nowrap ow-hidden overflow-ellipsis">
        {menuItem.product.name}
      </h3>

      <p className="flex justify-start w-full text-sm text-muted-foreground h-[60px] line-clamp-3 overflow-hidden text-ellipsis">
        {menuItem.product.description || t('menu.noDescription')}
      </p>
      <div className="flex flex-col justify-between w-full gap-1 mt-2 text-sm font-medium ">
        {menuItem?.product?.isLimit &&
          <span className='text-gray-400 text-[12px]'>
            {`${t('menu.stock')} ${menuItem.currentStock}/${menuItem.defaultStock}`}
          </span>}
        {menuItem.product.variants && (
          <span className="text-primary">{getPriceRange()}</span>
        )}
      </div>
      {menuItem.isLocked && (
        <div className="absolute bottom-2 right-2 flex items-center justify-center  w-9 h-9 rounded-full bg-red-500">
          <KeyRound color="white" size={23} />
        </div>
      )}
    </div>

  )
}
