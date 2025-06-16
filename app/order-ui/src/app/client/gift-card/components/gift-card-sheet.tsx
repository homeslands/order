import { Gift } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useMemo, useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  Button,
  Badge,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui'
import { GiftCardTypeSelect } from '@/components/app/select'
import { ConfirmGiftCardCheckoutDialog } from '@/components/app/dialog'
import { SingleGiftCardDisplay, ReceiversSection, OrderSummary } from './'
import { showErrorToast, showToast } from '@/utils'
import { useGiftCardStore, useUserStore } from '@/stores'
import { GiftCardType } from '@/constants'
import {
  createGiftCardCheckoutSchema,
  type TGiftCardCheckoutSchema,
} from '@/schemas'
import { useCreateCardOrder } from '@/hooks/use-gift-card'
import { useIsMobile } from '@/hooks'

export default function GiftCardSheet() {
  const { t } = useTranslation(['giftCard'])
  const navigate = useNavigate()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const isMobile = useIsMobile()

  const {
    giftCardItem,
    updateGiftCardQuantity: updateQuantity,
    clearGiftCard,
  } = useGiftCardStore()

  // Create dynamic schema with max quantity validation
  const dynamicSchema = useMemo(() => {
    return createGiftCardCheckoutSchema(giftCardItem?.quantity)
  }, [giftCardItem?.quantity])

  const form = useForm<TGiftCardCheckoutSchema>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      giftType: GiftCardType.SELF,
      receivers: [{ recipientSlug: '', quantity: 1, message: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'receivers',
  })

  const watchedGiftType = form.watch('giftType')
  const { userInfo } = useUserStore()
  const { mutate: createCardOrder } = useCreateCardOrder()

  const totalPoints = useMemo(() => {
    return giftCardItem ? giftCardItem.points * (giftCardItem.quantity || 1) : 0
  }, [giftCardItem])
  const totalAmount = useMemo(() => {
    return giftCardItem ? giftCardItem.price * (giftCardItem.quantity || 1) : 0
  }, [giftCardItem])

  // Reset form when sheet closes
  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open)
    if (!open) {
      // Reset form to default values when sheet closes
      form.reset({
        giftType: GiftCardType.SELF,
        receivers: [],
      })
    }
  }

  // Reset receivers when gift type changes to SELF
  useEffect(() => {
    if (watchedGiftType === GiftCardType.SELF) {
      // Clear any existing validation errors for receivers
      form.clearErrors('receivers')
      // Reset receivers array to empty when SELF is selected
      form.setValue('receivers', [])
    } else if (watchedGiftType === GiftCardType.GIFT) {
      // Ensure at least one receiver when GIFT is selected
      const receivers = form.getValues('receivers')
      if (!receivers || receivers.length === 0) {
        form.setValue('receivers', [
          { recipientSlug: '', quantity: 1, message: '' },
        ])
      }
    }
  }, [watchedGiftType, form])

  // Function to show confirmation dialog
  const handleShowConfirmDialog = form.handleSubmit(
    (_data) => {
      if (!giftCardItem) {
        showToast(t('giftCard.noGiftCardsInCart'))
        return
      }

      if (!userInfo?.slug) {
        showToast(t('giftCard.pleaseLogin'))
        return
      }

      // If validation passes, show confirmation dialog
      setConfirmDialogOpen(true)
    },
    () => {
      // Handle validation errors silently or show a generic error message
      showErrorToast(1005)
    },
  )

  // Function to actually process the checkout
  const handleConfirmCheckout = () => {
    const data = form.getValues()

    // Prepare recipients list if gift type is GIFT
    const recipients =
      data.giftType === GiftCardType.GIFT && data.receivers
        ? data.receivers
        : []

    // Create card order request
    createCardOrder(
      {
        customerSlug: userInfo!.slug,
        cardOrderType: data.giftType,
        cardSlug: giftCardItem!.slug,
        quantity: giftCardItem!.quantity,
        totalAmount: totalAmount,
        receipients: recipients,
      },
      {
        onSuccess: (response) => {
          showToast(t('giftCard.createGiftCardOrderSuccess'))
          clearGiftCard(false)
          handleSheetOpenChange(false)
          setConfirmDialogOpen(false)

          // Navigate to checkout page with order slug
          const orderSlug = response.result.slug
          navigate(`/gift-card/checkout/${orderSlug}`)
        },
      },
    )
  }

  const handleIncrement = () => {
    if (giftCardItem && giftCardItem.quantity < 10) {
      updateQuantity(giftCardItem.quantity + 1)
    }
  }

  const handleDecrement = () => {
    if (giftCardItem && giftCardItem.quantity > 1) {
      updateQuantity(giftCardItem.quantity - 1)
    }
  }
  return (
    <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed right-1 top-1/2 z-50 -translate-y-1/2 bg-primary text-white shadow-lg hover:bg-primary/90"
        >
          <Gift className="h-6 w-6" />
          {giftCardItem && (
            <Badge
              variant="secondary"
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
            >
              {giftCardItem.quantity}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className={`w-full ${!isMobile ? 'max-w-[90%]' : ''}`}
      >
        {/* Header for Mobile */}
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between p-6 pb-0">
            <h2 className="text-lg font-semibold">
              {giftCardItem
                ? t('giftCard.giftCardCart')
                : t('giftCard.availableGiftCards')}
            </h2>
          </div>
          <Form {...form}>
            <form
              onSubmit={handleShowConfirmDialog}
              className="flex h-full flex-col"
            >
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 pb-16">
                {/* Gift Card Items */}
                <div className="flex flex-col gap-4">
                  {giftCardItem ? (
                    <>
                      <SingleGiftCardDisplay
                        item={giftCardItem}
                        onIncrement={handleIncrement}
                        onDecrement={handleDecrement}
                        onClear={clearGiftCard}
                      />

                      <FormField
                        control={form.control}
                        name="giftType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t('giftCard.chooseUsageType')}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <GiftCardTypeSelect
                                value={field.value as GiftCardType}
                                onChange={(value) =>
                                  field.onChange(value as string)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                      <Gift className="mx-auto mb-6 h-24 w-24 text-gray-400" />
                      <h3 className="mb-2 text-xl font-semibold text-gray-500">
                        {t('giftCard.noGiftCardsInCart')}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {t('giftCard.addGiftCardsToCart')}
                      </p>
                    </div>
                  )}
                </div>
                {/* Input Forms for Gift */}
                {watchedGiftType === GiftCardType.GIFT && (
                  <ReceiversSection
                    control={form.control}
                    fields={fields}
                    append={append}
                    remove={remove}
                    quantity={giftCardItem?.quantity || 1}
                    form={form}
                  />
                )}
              </div>
              {/* Fixed Footer - Total Section */}{' '}
              {giftCardItem && (
                <OrderSummary
                  totalPoints={totalPoints}
                  totalAmount={totalAmount}
                  onCheckout={handleShowConfirmDialog}
                />
              )}
            </form>
          </Form>{' '}
        </div>
      </SheetContent>

      {/* Confirmation Dialog */}
      <ConfirmGiftCardCheckoutDialog
        isOpen={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={handleConfirmCheckout}
      />
    </Sheet>
  )
}
