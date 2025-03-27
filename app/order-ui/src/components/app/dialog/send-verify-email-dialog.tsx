import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Mail, ShoppingCart } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
  Input,
  DialogDescription,
} from '@/components/ui'

import { IVerifyEmailRequest } from '@/types'
import { useVerifyEmail } from '@/hooks'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'
import { useAuthStore, useCurrentUrlStore, useUserStore } from '@/stores'
import { TVerifyEmailSchema, verifyEmailSchema } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'

export default function SendVerifyEmailDialog() {
  const queryClient = useQueryClient()
  const { token } = useAuthStore()
  const { userInfo } = useUserStore()
  const { setCurrentUrl } = useCurrentUrlStore()
  const { t } = useTranslation(['profile', 'common'])
  const [isOpen, setIsOpen] = useState(false)
  const { mutate: verifyEmail } = useVerifyEmail()

  const form = useForm<TVerifyEmailSchema>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      accessToken: token,
      email: userInfo?.email || '',
    },
  })

  const handleSubmit = (data: IVerifyEmailRequest) => {
    verifyEmail(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEY.profile],
        })
        // get current url and set to store
        setCurrentUrl(window.location.href)
        showToast(t('toast.sendVerifyEmailSuccess'))
        setIsOpen(false)
      },
    })
  }

  const formFields = {
    email: (
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('profile.email')}</FormLabel>
            <FormControl>
              <Input {...field} placeholder={t('profile.enterEmail')} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild className="flex justify-start w-fit">
        <Button className="gap-1 px-2 text-sm" onClick={() => setIsOpen(true)}>
          <Mail />
          <span className="text-xs sm:text-sm">{t('profile.verifyEmail')}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] rounded-md px-6 sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="pb-4 border-b">
            <div className="flex gap-2 items-center text-primary">
              <ShoppingCart className="w-6 h-6" />
              {t('profile.verifyEmail')}
            </div>
          </DialogTitle>
          <DialogDescription>
            {t('profile.verifyEmailDescription')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-2">
              {Object.keys(formFields).map((key) => (
                <React.Fragment key={key}>
                  {formFields[key as keyof typeof formFields]}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-end">
              <Button className="flex justify-end" type="submit">
                {t('profile.sendVerifyEmail')}
              </Button>
            </div>
          </form>
        </Form>
        {/* <DialogFooter className="flex flex-row gap-2 justify-center">
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
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  )
}
