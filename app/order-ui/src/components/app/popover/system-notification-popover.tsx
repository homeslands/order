import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui'
import { BellIcon } from '@radix-ui/react-icons'

export default function SystemNotificationPopover() {
  return (
    <Popover>
      <PopoverTrigger>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-primary hover:text-white"
        >
          <BellIcon className="h-[1.1rem] w-[1.1rem]" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="mr-5 w-60 border-primary text-center text-xs lg:min-w-[30%]">
        Không có thông báo
      </PopoverContent>
    </Popover>
  )
}
