import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Trash2, TriangleAlert } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui'

import { ISystemConfig } from '@/types'

import { useDeleteSystemConfig } from '@/hooks'
import { showToast } from '@/utils'

export default function DeleteSystemConfigDialog({
  systemConfig,
  onClose,
}: {
  systemConfig: ISystemConfig
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['config'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { mutate: deleteSystemConfig } = useDeleteSystemConfig()
  const [, setIsOpen] = useState(false)

  const handleSubmit = (params: { key: string; slug: string }) => {
    deleteSystemConfig(params, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['systemConfigs'],
        })
        onClose()
        setIsOpen(false)
        showToast(tToast('toast.deleteSystemConfigSuccess'))
      },
    })
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogTrigger className="flex w-full justify-start" asChild>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="gap-1 text-sm"
            onClick={() => setIsOpen(true)}
          >
            <Trash2 className="icon" />
            {t('config.delete')}
          </Button>
        </DialogTrigger>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="border-b border-destructive pb-4 text-destructive">
            <div className="flex items-center gap-2">
              <TriangleAlert className="h-6 w-6" />
              {t('config.deleteSystemConfig')}
            </div>
          </DialogTitle>
          <DialogDescription className="rounded-md bg-red-100 p-2 text-destructive">
            {tCommon('common.deleteNote')}
          </DialogDescription>

          <div className="py-4 text-sm text-gray-500">
            {t('config.deleteContent')}{' '}
            <span className="font-bold">{systemConfig?.key}</span>
            {t('config.deleteContent2')}{' '}
            <span className="font-bold">{systemConfig?.key}</span>
            {t('config.deleteContent3')}
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-center gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {tCommon('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              systemConfig &&
              handleSubmit({ key: systemConfig.key, slug: systemConfig.slug })
            }
          >
            {tCommon('common.confirmDelete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
