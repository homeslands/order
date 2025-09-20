import SystemMenusInUpdateOrder from '@/app/system/menu/components/system-menus-in-update-order'
import { ISpecificMenu } from '@/types'

export function SystemMenuInUpdateOrderTabscontent({ menu, isLoading, onSuccess }: { menu?: ISpecificMenu, isLoading?: boolean, onSuccess?: () => void }) {

  return (
    <div
      className={`flex flex-col w-full`}
    >
      <SystemMenusInUpdateOrder menu={menu} isLoading={isLoading} onSuccess={onSuccess} />
    </div>
  )
}
