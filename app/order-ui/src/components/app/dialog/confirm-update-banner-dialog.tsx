import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { CircleAlert } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui'

import { IUpdateBannerRequest } from '@/types'
import { useUpdateBanner } from '@/hooks'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'
import { IsActiveBannerSwitch } from '../switch'

interface IConfirmUpdateBannerDialogProps {
  // isOpen: boolean
  // onOpenChange: (isOpen: boolean) => void
  onCompleted: () => void
  banner: IUpdateBannerRequest | null
  disabled?: boolean
  onSuccess?: () => void
}

export default function ConfirmUpdateBannerDialog({
  onCompleted,
  banner,
  disabled,
}: IConfirmUpdateBannerDialogProps) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['banner'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const [isOpen, setIsOpen] = useState(false)
  const [isActive, setIsActive] = useState(banner?.isActive || false)
  const { mutate: updateBanner } = useUpdateBanner()

  const handleSubmit = (banner: IUpdateBannerRequest) => {
    if (!banner) return
    updateBanner(
      { ...banner, url: banner.useButtonUrl ? banner.url : "", isActive },
      {
        onSuccess: () => {
          setIsActive(false)
          onCompleted()
          setIsOpen(false)
          queryClient.invalidateQueries({
            queryKey: [QUERYKEY.banners]
          })
          showToast(tToast('toast.updateBannerSuccess'))
        },
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          disabled={disabled}
          className="flex items-center w-full text-sm rounded-full sm:w-[10rem]"
          onClick={() => setIsOpen(true)}
        >
          {t('banner.update')}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md px-6 sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b">
            <div className="flex items-center gap-2 text-primary">
              <CircleAlert className="w-6 h-6" />
              {t('banner.update')}
            </div>
          </DialogTitle>

          <div className="py-4 text-sm text-gray-500">
            {t('banner.confirmUpdateBanner')}
            <br />
            <IsActiveBannerSwitch
              defaultValue={banner?.isActive || false}
              onChange={(value) => setIsActive(value)}
            />
            <span className='text-xs text-muted-foreground'>
              {t('banner.isActiveDescription')}
            </span>
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="border border-gray-300 min-w-24"
          >
            {tCommon('common.cancel')}
          </Button>
          <Button onClick={() => banner && handleSubmit(banner)}>
            {t('banner.update')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
