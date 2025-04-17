import moment from 'moment'
import { useTranslation } from 'react-i18next'

import { useBranchStore } from '@/stores'
import { useSpecificMenu } from '@/hooks'
import { SkeletonMenuList } from '../skeleton'
import { ClientMenuItemInUpdateOrder } from '@/app/client/menu/components/client-menu-item-in-update-order'

interface ClientMenuTabscontentProps {
  onSuccess: () => void
}

export function ClientMenuTabscontent({ onSuccess }: ClientMenuTabscontentProps) {
  const { branch } = useBranchStore()
  const { t } = useTranslation('menu')
  function getCurrentDate() {
    return moment().format('YYYY-MM-DD')
  }
  const { data: specificMenu, isLoading } = useSpecificMenu({
    date: getCurrentDate(),
    branch: branch?.slug,
  })
  const menuItems = specificMenu?.result.menuItems.sort((a, b) => {
    // Đưa các mục không bị khóa lên trước
    if (a.isLocked !== b.isLocked) {
      return Number(a.isLocked) - Number(b.isLocked);
    }

    // Coi mục với currentStock = null là "còn hàng" khi isLimit = false
    const aInStock = (a.currentStock !== 0 && a.currentStock !== null) || !a.product.isLimit;
    const bInStock = (b.currentStock !== 0 && b.currentStock !== null) || !b.product.isLimit;

    // Đưa các mục còn hàng lên trước
    if (aInStock !== bInStock) {
      return Number(bInStock) - Number(aInStock); // Còn hàng trước hết hàng
    }
    if (a.product.catalog.name !== b.product.catalog.name) {
      return a.product.catalog.name.localeCompare(b.product.catalog.name)
    }
    return 0;
  })

  if (isLoading) {
    return (
      <div className={`grid grid-cols-2 gap-3 lg:grid-cols-3`}>
        {[...Array(8)].map((_, index) => (
          <SkeletonMenuList key={index} />
        ))}
      </div>
    )
  }

  if (!menuItems || menuItems.length === 0) {
    return <p className="text-center">{t('menu.noData')}</p>
  }

  return (
    <div
      className={`flex flex-col pr-2 w-full transition-all duration-300 ease-in-out`}
    >
      <div className={`grid grid-cols-2 gap-4 lg:grid-cols-3`}>
        {specificMenu?.result.menuItems.map((item) => (
          <ClientMenuItemInUpdateOrder onSuccess={onSuccess} item={item} key={item.slug} />
        ))}
      </div>
    </div>
  )
}
