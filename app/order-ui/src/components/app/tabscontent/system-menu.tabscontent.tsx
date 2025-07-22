import SystemMenus from '@/app/system/menu/components/system-menus'
import { ISpecificMenu } from '@/types'

export function SystemMenuTabscontent({ menu, isLoading }: { menu?: ISpecificMenu, isLoading?: boolean }) {

  return (
    <div
      className={`flex flex-col w-full`}
    >
      <SystemMenus menu={menu} isLoading={isLoading} />
    </div>
  )
}
