import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
  DialogFooter,
  Switch,
} from '@/components/ui'
import { useBulkToggleParentFeatureFlags } from '@/hooks'
import { useQueryClient } from '@tanstack/react-query'
import { QUERYKEY } from '@/constants'
import { showToast } from '@/utils'

export default function ChangeFeatureLockStatusDialog({ featureSlug, isLocked }: { featureSlug: string, isLocked: boolean }) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['system'])
  const { t: tCommon } = useTranslation(['common'])
  const { t: tToast } = useTranslation('toast')
  const [isOpen, setIsOpen] = useState(false)
  const { mutate: bulkToggleParentFeatureFlags, isPending: isSaving } = useBulkToggleParentFeatureFlags()

  const handleChangeFeatureLockStatus = (featureSlug: string, isLocked: boolean) => {
    bulkToggleParentFeatureFlags([{ slug: featureSlug, isLocked }], {
      onSuccess: () => {
        // Invalidate system feature flag groups query
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.systemFeatureFlagGroups],
          exact: false,
          refetchType: 'all'
        })
        // Also invalidate any system feature flags by group queries
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.systemFeatureFlagsByGroup],
          exact: false,
          refetchType: 'all'
        })
        showToast(tToast('toast.changeFeatureLockStatusSuccess'))
        setIsOpen(false)
      },
      onError: (_error) => {
        showToast(tToast('toast.changeFeatureLockStatusError'))
      }
    })
  }

  const handleSwitchClick = () => {
    setIsOpen(true)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="flex justify-start">
          <Switch
            id={featureSlug}
            checked={isLocked}
            onCheckedChange={handleSwitchClick}
            disabled={isSaving}
          />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[18rem] overflow-hidden rounded-lg transition-all duration-300 hover:overflow-y-auto sm:max-h-[32rem] sm:max-w-[28rem]">
        <DialogHeader>
          <DialogTitle>{t('system.lockFeature.title')}</DialogTitle>
          <DialogDescription>{t('system.lockFeature.description')}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row gap-2 justify-between sm:justify-end">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => setIsOpen(false)}
          >
            {tCommon('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            className="w-full sm:w-auto"
            onClick={() => handleChangeFeatureLockStatus(featureSlug, !isLocked)}
          >
            {tCommon('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
