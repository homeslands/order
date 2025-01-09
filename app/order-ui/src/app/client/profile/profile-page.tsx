import { SquareMenu } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { ProfileForm } from '@/components/app/form'

export default function ProfilePage() {
  const { t } = useTranslation(['profile'])
  return (
    <div className="container flex flex-col h-full pb-4 mx-auto">
      <div className="sticky top-0 z-10 flex flex-col items-center gap-2">
        <span className="flex items-center justify-start w-full gap-1 py-4 text-lg">
          <SquareMenu />
          {t('profile.title')}
        </span>
      </div>
      {/* Menu Section - Scrollable */}
      <div
        className={`transition-all duration-300 ease-in-out w-full`}
      >
        <div className="w-full">
          <ProfileForm />
        </div>
      </div>
    </div>
  )
}
