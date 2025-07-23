import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Gift, Sparkles, Star, X, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUseGiftCard } from '@/hooks/use-gift-card'
import { useUserStore } from '@/stores'
import { useIsMobile } from '@/hooks'

export default function UseGiftCardDialog() {
  const { t } = useTranslation(['giftCard'])
  const { t: tCommon } = useTranslation('common')
  const { t: tSidebar } = useTranslation('sidebar')
  const [isOpen, setIsOpen] = useState(false)
  const [serial, setSerial] = useState('')
  const [code, setCode] = useState('')

  const { userInfo } = useUserStore()
  const isMobile = useIsMobile()
  const useGiftCardMutation = useUseGiftCard()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!serial.trim() || !code.trim()) {
      return
    }

    if (!userInfo?.slug) {
      return
    }

    await useGiftCardMutation.mutate(
      {
        serial: serial.trim(),
        code: code.trim(),
        userSlug: userInfo.slug,
      },
      {
        onSuccess: () => {
          setSerial('')
          setCode('')
          setIsOpen(false)
        },
      },
    )
  }

  const handleClose = () => {
    setSerial('')
    setCode('')
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-9 w-full justify-start gap-1 text-sm"
        >
          <Gift className="icon text-primary" />
          <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text font-medium text-transparent">
            {tSidebar('header.useGiftCard')}
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent
        className={
          isMobile
            ? 'max-w-[90%] rounded-lg border-0 bg-white/95 px-2 py-4 backdrop-blur-xl dark:bg-gray-900/95'
            : 'max-w-md border-0 bg-white/95 backdrop-blur-xl dark:bg-gray-900/95'
        }
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-gradient-to-br from-primary/15 to-purple-500/15 blur-2xl" />
          <div className="absolute -bottom-6 -left-6 h-40 w-40 rounded-full bg-gradient-to-tr from-primary/10 to-pink-500/10 blur-2xl" />
          <Sparkles className="absolute right-6 top-6 h-4 w-4 animate-pulse text-primary/40" />
          <Star className="absolute bottom-8 right-8 h-3 w-3 animate-bounce text-purple-500/40" />
          <Star
            className="absolute left-8 top-12 h-2 w-2 animate-pulse text-pink-500/30"
            style={{ animationDelay: '1s' }}
          />
        </div>
        {/* Dialog header */}
        <div className="relative z-10">
          <DialogHeader className="space-y-4 text-center">
            <div
              className={
                isMobile
                  ? 'mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary via-primary to-purple-600 shadow-lg shadow-primary/25'
                  : 'mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary via-primary to-purple-600 shadow-lg shadow-primary/25'
              }
            >
              <Gift
                className={
                  isMobile ? 'h-10 w-10 text-white' : 'h-8 w-8 text-white'
                }
              />
            </div>
            <DialogTitle
              className={
                isMobile
                  ? 'bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-2xl font-bold text-transparent'
                  : 'bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-xl font-bold text-transparent'
              }
            >
              {t('giftCard.useGiftCard')}
            </DialogTitle>
            <div className="space-y-2">
              <p
                className={
                  isMobile
                    ? 'text-base text-gray-600 dark:text-gray-400'
                    : 'text-sm text-gray-600 dark:text-gray-400'
                }
              >
                {t('giftCard.enterGiftCardDetails')}
              </p>
              <div
                className={
                  isMobile
                    ? 'mx-auto flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary dark:bg-primary/20'
                    : 'mx-auto flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs text-primary dark:bg-primary/20'
                }
              >
                <Gift className={isMobile ? 'h-4 w-4' : 'h-3 w-3'} />
                <span className={`${isMobile ? 'text-xs' : 'font-medium'}`}>
                  {t('giftCard.enterGiftCard')}
                </span>
              </div>
            </div>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            className={isMobile ? 'mt-8 space-y-8' : 'mt-6 space-y-6'}
          >
            <div className="space-y-3">
              <Label
                htmlFor="serial"
                className={
                  isMobile
                    ? 'flex items-center gap-2 text-base font-semibold text-gray-700 dark:text-gray-300'
                    : 'flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300'
                }
              >
                <Gift
                  className={
                    isMobile ? 'h-5 w-5 text-primary' : 'h-4 w-4 text-primary'
                  }
                />
                {t('giftCard.giftCardSerial')}
              </Label>
              <div className="relative">
                <Input
                  id="serial"
                  type="text"
                  value={serial}
                  onChange={(e) => setSerial(e.target.value)}
                  placeholder={t('giftCard.enterSerial')}
                  className={
                    isMobile
                      ? 'h-14 border-2 border-gray-200 bg-gray-50/50 pl-5 pr-5 font-mono text-lg tracking-wider transition-all duration-200 hover:border-gray-300 focus:border-gray-300 focus:bg-white focus:ring-4 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-gray-600 dark:focus:border-gray-600 dark:focus:bg-gray-800'
                      : 'h-12 border-2 border-gray-200 bg-gray-50/50 pl-4 pr-4 font-mono text-base tracking-wider transition-all duration-200 hover:border-gray-300 focus:border-gray-300 focus:bg-white focus:ring-4 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-gray-600 dark:focus:border-gray-600 dark:focus:bg-gray-800'
                  }
                  disabled={useGiftCardMutation.isPending}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="code"
                className={
                  isMobile
                    ? 'flex items-center gap-2 text-base font-semibold text-gray-700 dark:text-gray-300'
                    : 'flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300'
                }
              >
                <Sparkles
                  className={
                    isMobile ? 'h-5 w-5 text-primary' : 'h-4 w-4 text-primary'
                  }
                />
                {t('giftCard.giftCardCode')}
              </Label>
              <div className="relative">
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={t('giftCard.enterCode')}
                  className={
                    isMobile
                      ? 'h-14 border-2 border-gray-200 bg-gray-50/50 pl-5 pr-5 font-mono text-lg tracking-wider transition-all duration-200 hover:border-gray-300 focus:border-gray-300 focus:bg-white focus:ring-4 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-gray-600 dark:focus:border-gray-600 dark:focus:bg-gray-800'
                      : 'h-12 border-2 border-gray-200 bg-gray-50/50 pl-4 pr-4 font-mono text-base tracking-wider transition-all duration-200 hover:border-gray-300 focus:border-gray-300 focus:bg-white focus:ring-4 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-gray-600 dark:focus:border-gray-600 dark:focus:bg-gray-800'
                  }
                  disabled={useGiftCardMutation.isPending}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={useGiftCardMutation.isPending}
                className={
                  isMobile
                    ? 'hover:via-red-25 group relative h-14 flex-1 overflow-hidden rounded-xl border-2 border-gray-300/60 bg-gradient-to-br from-gray-50 via-white to-gray-100 font-semibold text-gray-700 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-red-300 hover:from-red-50 hover:to-red-100 hover:text-red-700 hover:shadow-xl hover:shadow-red-500/20 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 dark:text-gray-300 dark:hover:border-red-500 dark:hover:from-red-900 dark:hover:to-red-800 dark:hover:text-red-200'
                    : 'hover:via-red-25 group relative h-12 flex-1 overflow-hidden rounded-xl border-2 border-gray-300/60 bg-gradient-to-br from-gray-50 via-white to-gray-100 font-semibold text-gray-700 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-red-300 hover:from-red-50 hover:to-red-100 hover:text-red-700 hover:shadow-xl hover:shadow-red-500/20 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 dark:text-gray-300 dark:hover:border-red-500 dark:hover:from-red-900 dark:hover:to-red-800 dark:hover:text-red-200'
                }
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <X
                    className={
                      isMobile
                        ? 'h-5 w-5 transition-transform duration-200 group-hover:rotate-90'
                        : 'h-4 w-4 transition-transform duration-200 group-hover:rotate-90'
                    }
                  />
                  {tCommon('common.close')}
                </span>
                <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-red-500/10 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />
              </Button>

              <Button
                type="submit"
                disabled={
                  !serial.trim() ||
                  !code.trim() ||
                  useGiftCardMutation.isPending
                }
                className={
                  isMobile
                    ? 'group relative h-14 flex-1 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-lg font-bold text-white shadow-xl shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 hover:shadow-2xl hover:shadow-emerald-500/40 active:translate-y-0 active:scale-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:scale-100'
                    : 'group relative h-12 flex-1 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 font-bold text-white shadow-xl shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 hover:shadow-2xl hover:shadow-emerald-500/40 active:translate-y-0 active:scale-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:scale-100'
                }
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {useGiftCardMutation.isPending ? (
                    <Loader2
                      className={
                        isMobile
                          ? 'h-6 w-6 animate-spin'
                          : 'h-5 w-5 animate-spin'
                      }
                    />
                  ) : (
                    <div className="relative">
                      <Gift
                        className={
                          isMobile
                            ? 'h-6 w-6 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110'
                            : 'h-5 w-5 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110'
                        }
                      />
                      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-30" />
                    </div>
                  )}
                  <span
                    className={`${isMobile ? 'text-[10px]' : 'text-sm'} bg-gradient-to-r from-yellow-200 to-white bg-clip-text font-extrabold tracking-wide text-transparent`}
                  >
                    {t('giftCard.useGiftCard')}
                  </span>
                </span>

                {/* Animated background effect */}
                <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />

                {/* Sparkle effects */}
                <div
                  className="absolute right-3 top-2 h-1 w-1 animate-ping rounded-full bg-yellow-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ animationDelay: '0.1s' }}
                />
                <div
                  className="absolute bottom-3 left-4 h-1 w-1 animate-ping rounded-full bg-cyan-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ animationDelay: '0.3s' }}
                />
                <div
                  className="absolute left-1/3 top-4 h-0.5 w-0.5 animate-ping rounded-full bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ animationDelay: '0.5s' }}
                />
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
