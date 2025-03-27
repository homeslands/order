import { useState } from 'react'

import { ScrollArea, useSidebar } from '@/components/ui'
import { UserProfileCard } from '@/components/app/card'

export default function ProfilePage() {
  const [isCartOpen] = useState(true)
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  return (
    <div className="flex flex-row gap-2 h-full">
      {/* Menu Section - Scrollable */}
      <ScrollArea className="flex-1">
        <div
          className={`transition-all duration-300 ease-in-out${isCartOpen ? 'w-[70%]' : 'w-full'
            } ${isCollapsed ? 'pl-2' : ''}`}
        >
          <div className="flex sticky top-0 z-10 flex-col gap-2 items-center pb-4">
            <div className="w-full">
              <UserProfileCard />
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
