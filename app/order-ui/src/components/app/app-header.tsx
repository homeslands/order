import { Button, SidebarTrigger } from '@/components/ui'
import { DropdownHeader, ModeToggle } from '@/components/app/dropdown'
// import { SearchBar } from '@/components/app/input'
import { useUserStore } from '@/stores'
import { BellIcon } from '@radix-ui/react-icons'

export default function AppHeader() {
  const { userInfo } = useUserStore()
  return (
    <header className="sticky top-0 z-20 w-full border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center flex-1 w-full h-14">
        <div className="flex flex-row items-center gap-6">
          <Button variant="ghost" size="icon" className="hover::bg-primary">
            <SidebarTrigger />
          </Button>
        </div>
        <div className="flex items-center justify-end flex-1 w-full gap-2">
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
          <span className="flex-col hidden sm:flex">
            <span className="ml-2 text-sm font-semibold">
              {userInfo?.firstName} {userInfo?.lastName}
            </span>
          </span>
        </div>
      </div>
    </header>
  )
}
