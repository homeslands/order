import { SidebarTrigger } from '@/components/ui'
import {
  SettingsDropdown,
  SystemProfileDropdown,
} from '@/components/app/dropdown'
import { SystemNotificationPopover } from '@/components/app/popover'
import { CartDrawer } from '@/components/app/drawer'

export function AppHeader() {
  return (
    <header className={`sticky top-0 z-30 w-full shadow-md text-muted-foreground backdrop-blur-lg`}>
      <div className="flex items-center justify-between h-14">
        <SidebarTrigger />
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <SystemNotificationPopover />

          {/* Settings */}
          <SettingsDropdown />

          <CartDrawer className="lg:hidden" />

          {/* User */}
          <SystemProfileDropdown />
        </div>
      </div>
    </header>
  )
}
