import { Skeleton } from '@/components/ui'
import { SquareMenu } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function RoleDetailSkeleton() {
  const { t } = useTranslation(['role'])
  return (
    <div className="flex flex-col gap-3">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <SquareMenu className="w-6 h-6" />
            <p>{t('role.title')}</p>
          </div>
        </div>
        <Skeleton className="grid items-center grid-cols-10 gap-4 p-4 text-sm rounded-md bg-muted-foreground/10 text-muted-foreground">
          <span className='col-span-1'>{t(`role.name`)}</span>
          <Skeleton className='h-12 col-span-9' />
        </Skeleton>
      </div>

      {/* Permissions List */}
      <h2 className="text-lg font-semibold">
        {t('role.authorityList')}
      </h2>
      <div className="p-4 mb-4 rounded-md bg-muted-foreground/10">
        <div className="space-y-4">
          {/* Authority Groups */}
          {[...Array(4)].map((_, index) => (
            <div key={index}>
              <div className="grid">
                {[...Array(1)].map((_, i) => (
                  <div key={i} className="grid items-center justify-between grid-cols-9 gap-4 py-1">
                    <Skeleton className="w-full h-12 col-span-7" />
                    <Skeleton className="w-full h-12 col-span-2" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
