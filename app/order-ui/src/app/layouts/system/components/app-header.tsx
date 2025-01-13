import { Button, SidebarTrigger } from '@/components/ui'
import { DropdownHeader, ModeToggle } from '@/components/app/dropdown'
import { useUserStore } from '@/stores'
import { BellIcon } from '@radix-ui/react-icons'

export function AppHeader() {
  const { userInfo } = useUserStore()
  return (
    <header className="sticky top-0 z-20 w-full border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 w-full flex-1 items-center">
        <div className="flex flex-row items-center gap-6">
          <Button variant="ghost" size="icon" className="hover::bg-primary">
            <SidebarTrigger />
          </Button>
        </div>
        <div className="flex w-full flex-1 items-center justify-end gap-2">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="hover::bg-primary-foreground/20"
          >
            <BellIcon className="h-[1.1rem] w-[1.1rem]" />
          </Button>

          {/* Settings */}
          <ModeToggle />

          {/* User */}
          <DropdownHeader />
          <span className="hidden flex-col sm:flex">
            <span className="ml-2 text-sm font-semibold">
              {userInfo?.firstName} {userInfo?.lastName}
            </span>
          </span>
        </div>
      </div>
    </header>
  )
}
