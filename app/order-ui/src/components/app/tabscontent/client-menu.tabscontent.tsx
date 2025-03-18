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
    branch: branch ? branch?.slug : '',
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

  if (!specificMenu?.result.menuItems || specificMenu?.result.menuItems.length === 0) {
    return <p className="text-center">{t('menu.noData')}</p>
  }

  return (
    <div
      className={`flex w-full flex-col pr-2 transition-all duration-300 ease-in-out`}
    >
      <div className={`grid grid-cols-2 gap-4 lg:grid-cols-3`}>
        {specificMenu?.result.menuItems.map((item) => (
          <ClientMenuItemInUpdateOrder onSuccess={onSuccess} item={item} key={item.slug} />
        ))}
      </div>
    </div>
  )
}
