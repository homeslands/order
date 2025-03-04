import { useState } from 'react'

import { ScrollArea, useSidebar } from '@/components/ui'
import { ProfileForm } from '@/components/app/form'

export default function ProfilePage() {
  const [isCartOpen] = useState(true)
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  return (
    <div className="flex flex-row h-full gap-2">
      {/* Menu Section - Scrollable */}
      <ScrollArea className="flex-1">
        <div
          className={`transition-all duration-300 ease-in-out${isCartOpen ? 'w-[70%]' : 'w-full'
            } ${isCollapsed ? 'pl-2' : ''}`}
        >
          <div className="sticky top-0 z-10 flex flex-col items-center gap-2 pb-4">
            <div className="w-full">
              <ProfileForm />
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
