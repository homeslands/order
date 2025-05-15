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

export function MenuItemCard({ menuItem, isTemplate, onSuccess }: MenuItemCardProps) {
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
    <div className={`relative flex flex-col items-center justify-between gap-2 ${menuItem.isLocked ? 'opacity-50 bg-destructive/10 border-destructive' : ''} p-2 border border-muted-foreground/40 group rounded-xl`}>
      <div className="flex absolute inset-0 justify-end items-start opacity-0 transition-opacity group-hover:opacity-100">
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

      <div className='flex flex-col w-full'>
        <span className="flex flex-wrap justify-start w-full text-xl font-bold break-words">
          {menuItem.product.name}
        </span>


        <p className="flex justify-start w-full text-sm text-muted-foreground h-[80px] line-clamp-3 overflow-hidden text-ellipsis">
          {menuItem.product.description || t('menu.noDescription')}
        </p>
      </div>
      <div className="flex flex-col gap-1 justify-between mt-2 w-full text-sm font-medium">
        {menuItem?.product?.isLimit &&
          <span className='text-gray-400 text-[12px]'>
            {`${t('menu.stock')} ${menuItem.currentStock}/${menuItem.defaultStock}`}
          </span>}
        {menuItem.product.variants && (
          <span className="text-lg font-bold text-primary">{getPriceRange()}</span>
        )}
      </div>
      {menuItem.isLocked && (
        <div className="flex absolute right-2 bottom-2 justify-center items-center w-9 h-9 bg-red-500 rounded-full">
          <KeyRound color="white" size={23} />
        </div>
      )}
    </div>

  )
}
