import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Mail, ShoppingCart } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui'

import { IVerifyEmailRequest } from '@/types'
import { useVerifyEmail } from '@/hooks'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'
import { useAuthStore, useCurrentUrlStore, useUserStore } from '@/stores'

export default function SendVerifyEmailDialog() {
  const queryClient = useQueryClient()
  const { token } = useAuthStore()
  const { userInfo } = useUserStore()
  const { setCurrentUrl } = useCurrentUrlStore()
  const { t } = useTranslation(['profile'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const [isOpen, setIsOpen] = useState(false)
  const { mutate: verifyEmail } = useVerifyEmail()

  const handleSubmit = () => {
    if (!userInfo || !token) return
    const verifyParamsData: IVerifyEmailRequest = {
      email: userInfo?.email || '',
      // email: 'cmstbethaibinh@gmail.com',
      accessToken: token || '',
    }

    verifyEmail(verifyParamsData, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.profile]
        })
        // get current url and set to store
        setCurrentUrl(window.location.href)
        showToast(tToast('toast.sendVerifyEmailSuccess'))
        setIsOpen(false)
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="flex items-center h-10 w-full text-sm sm:w-[10rem]"
          onClick={() => setIsOpen(true)}
        >
          <Mail />
          {t('profile.verifyEmail')}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md px-6 sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b">
            <div className="flex items-center gap-2 text-primary">
              <ShoppingCart className="w-6 h-6" />
              {t('profile.verifyEmail')}
            </div>
          </DialogTitle>

          <div className="py-4 text-sm text-gray-500">
            {t('profile.verifyEmailDescription')}
            <br />
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
          <Button onClick={handleSubmit}>
            {t('profile.sendVerifyEmail')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
