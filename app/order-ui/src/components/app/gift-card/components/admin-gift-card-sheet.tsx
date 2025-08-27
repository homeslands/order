import { Gift } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useMemo, useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'

import {
  Sheet,
  SheetContent,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui'
import { GiftCardTypeSelect } from '@/components/app/select'
import { ConfirmGiftCardCheckoutDialog } from '@/components/app/dialog'
import {
  SingleGiftCardDisplay,
  ReceiversSection,
  OrderSummary,
  DraggableGiftCardButton,
  CashierSession,
  CustomerSearchInput,
} from '.'
import { showToast, showErrorToast } from '@/utils'
import { useGiftCardStore, useUserStore } from '@/stores'
import { GiftCardFlagGroup, GiftCardType, ROUTE } from '@/constants'
import {
  createGiftCardCheckoutSchema,
  type TGiftCardCheckoutSchema,
} from '@/schemas'
import {
  useCreateCardOrder,
  useGetFeatureFlagsByGroup,
  useSyncGiftCard,
} from '@/hooks/use-gift-card'
import { useIsMobile } from '@/hooks'
import { IUserInfoBasic } from '@/types'

export default function AdminGiftCardSheet() {
  const { t } = useTranslation(['giftCard'])
  const navigate = useNavigate()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [hasSelectedRecipients, setHasSelectedRecipients] = useState(false)
  const [customerInfo, setCustomerInfo] = useState<IUserInfoBasic>()
  const [hasCustomerInfo, setHasCustomerInfo] = useState(false)
  const [isRestoringCustomerInfo, setIsRestoringCustomerInfo] = useState(false)
  const isMobile = useIsMobile()
  const {
    giftCardItem,
    updateGiftCardQuantity: updateQuantity,
    clearGiftCard,
  } = useGiftCardStore()
  // Synchronize the current gift card with the server when the sheet is opened
  const { refetch: refetchGiftCard } = useSyncGiftCard(
    giftCardItem?.slug || null,
    {
      enabled: sheetOpen && !!giftCardItem?.slug,
    },
  )
  const { data: featureFlagsResponse } = useGetFeatureFlagsByGroup(
    GiftCardFlagGroup.GIFT_CARD,
  )
  const featureFlags = featureFlagsResponse?.result || []
  const isAllLocked =
    featureFlags && featureFlags.every((flag) => flag.isLocked)
  const defaultGiftCardType = isAllLocked
    ? GiftCardType.NONE
    : featureFlags.find((flag) => !flag.isLocked)?.name || GiftCardType.SELF

  // Wrapper function for clearGiftCard to also reset the receivers section
  const handleClearGiftCard = (showNotification = true) => {
    clearGiftCard(showNotification)
    // Reset receivers array to empty
    form.setValue('receivers', [])
    // Reset giftType to SELF
    form.setValue('giftType', defaultGiftCardType)
  }

  // Create dynamic schema with max quantity validation
  const dynamicSchema = useMemo(() => {
    return createGiftCardCheckoutSchema(giftCardItem?.quantity)
  }, [giftCardItem?.quantity])

  const form = useForm<TGiftCardCheckoutSchema>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      giftType:
        giftCardItem?.type &&
        featureFlags.some(
          (flag) => flag.name === giftCardItem.type && !flag.isLocked,
        )
          ? giftCardItem.type
          : defaultGiftCardType,
      receivers:
        giftCardItem?.receipients && giftCardItem.receipients.length > 0
          ? giftCardItem.receipients
          : [{ recipientSlug: '', quantity: 1, message: '' }],
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
        giftType: defaultGiftCardType,
        receivers: [],
      })
      // Reset recipient selection state
      setHasSelectedRecipients(false)
    } else {
      // Ensure form has default value when opening
      if (!form.getValues('giftType')) {
        form.setValue('giftType', defaultGiftCardType)
      }
    }
  }
  // Reset receivers when gift type changes to SELF
  useEffect(
    () => {
      // Ensure form always has a default giftType value
      if (!watchedGiftType) {
        // Set default giftType to SELF if not already set
        form.setValue('giftType', defaultGiftCardType)
        return
      }

      if (
        watchedGiftType === GiftCardType.SELF ||
        watchedGiftType === GiftCardType.BUY
      ) {
        // Clear any existing validation errors for receivers
        form.clearErrors('receivers')
        // Reset receivers array to empty when SELF is selected
        form.setValue('receivers', [])
        // Reset item quantity to 1
        updateQuantity(1)
        // Reset recipient selection state
        setHasSelectedRecipients(false)
      } else if (watchedGiftType === GiftCardType.GIFT) {
        // Ensure at least one receiver when GIFT is selected
        const receivers = form.getValues('receivers')
        if (!receivers || receivers.length === 0) {
          form.setValue('receivers', [
            {
              recipientSlug: '',
              quantity: 1,
              message: '',
              name: '',
              userInfo: undefined,
            },
          ])
        }
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [watchedGiftType, form, updateQuantity],
  )

  useEffect(
    () => {
      if (featureFlags.length > 0) {
        const unlockedType = featureFlags.some(
          (flag) => flag.name === giftCardItem?.type && !flag.isLocked,
        )
          ? giftCardItem?.type
          : featureFlags.find((flag) => !flag.isLocked)?.name ||
            GiftCardType.NONE
        form.setValue('giftType', unlockedType ?? GiftCardType.SELF)
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [featureFlags],
  )

  useEffect(() => {
    if (giftCardItem?.customerInfo) {
      setCustomerInfo(giftCardItem.customerInfo)
      setHasCustomerInfo(true)
      setIsRestoringCustomerInfo(true)
    }
  }, [giftCardItem?.customerInfo])

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
        ? data.receivers.map(
            ({ userInfo: _userInfo, name: _name, ...rest }) => rest,
          )
        : []

    // Create card order request
    createCardOrder(
      {
        customerSlug: customerInfo!.slug,
        cashierSlug: userInfo!.slug,
        cardOrderType: data.giftType,
        cardSlug: giftCardItem!.slug,
        quantity: giftCardItem!.quantity,
        totalAmount: totalAmount,
        receipients: recipients,
        cardVersion: giftCardItem!.version ?? 0,
      },
      {
        onSuccess: (response) => {
          showToast(t('giftCard.createGiftCardOrderSuccess'))
          handleClearGiftCard(false)
          handleSheetOpenChange(false)
          setConfirmDialogOpen(false)

          // Navigate to checkout page with order slug
          const orderSlug = response.result.slug
          navigate(`${ROUTE.STAFF_GIFT_CARD_CHECKOUT}/${orderSlug}`)
        },
        onError: () => {
          showErrorToast(1006)
          // Directly trigger a refetch of the gift card data
          if (giftCardItem?.slug) {
            refetchGiftCard()
          }
        },
      },
    )
  }
  const handleIncrement = () => {
    if (giftCardItem && giftCardItem.quantity < 100) {
      updateQuantity(giftCardItem.quantity + 1)
    }
  }

  const handleDecrement = () => {
    if (giftCardItem && giftCardItem.quantity > 1) {
      updateQuantity(giftCardItem.quantity - 1)
    }
  }

  return (
    <>
      {/* Draggable Gift Card Button */}
      <DraggableGiftCardButton
        quantity={giftCardItem?.quantity}
        onClick={() => setSheetOpen(true)}
      />
      {/* Gift Card Sheet */}{' '}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className={`w-full bg-background ${!isMobile ? 'max-w-[90%]' : ''}`}
        >
          {/* Header for Mobile */}
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between p-6 pb-0">
              <h2 className="text-lg font-semibold text-foreground">
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
                <div className="flex-1 overflow-y-auto bg-background px-6 pb-16">
                  {/* Gift Card Items */}
                  <div className="mb-4 flex flex-col gap-4">
                    {giftCardItem ? (
                      <>
                        <SingleGiftCardDisplay
                          item={giftCardItem}
                          onIncrement={handleIncrement}
                          onDecrement={handleDecrement}
                          onClear={handleClearGiftCard}
                          giftCardType={watchedGiftType}
                        />
                        <CashierSession />
                        {/*Customer Info Field */}
                        <FormItem>
                          <FormLabel>
                            {t('giftCard.customer.title')}
                            <span className="text-destructive dark:text-red-400">
                              *
                            </span>
                          </FormLabel>
                          <FormControl>
                            <CustomerSearchInput
                              setCustomerInfo={setCustomerInfo}
                              onCustomerSelectionChange={setHasCustomerInfo}
                              customerInfo={customerInfo}
                              hasCustomerInfo={isRestoringCustomerInfo}
                              setHasCustomerInfo={setIsRestoringCustomerInfo}
                            />
                          </FormControl>
                        </FormItem>

                        {hasCustomerInfo && (
                          <FormField
                            control={form.control}
                            name="giftType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {t('giftCard.chooseUsageType')}
                                  <span className="text-destructive dark:text-red-400">
                                    *
                                  </span>
                                </FormLabel>
                                <FormControl>
                                  <GiftCardTypeSelect
                                    value={field.value as GiftCardType}
                                    onChange={(value) =>
                                      field.onChange(value as string)
                                    }
                                    featureFlags={featureFlags}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20">
                        <Gift className="mx-auto mb-6 h-24 w-24 text-muted-foreground" />
                        <h3 className="mb-2 text-xl font-semibold text-foreground">
                          {t('giftCard.noGiftCardsInCart')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t('giftCard.addGiftCardsToCart')}
                        </p>
                      </div>
                    )}
                  </div>
                  {/* Input Forms for Gift */}
                  {watchedGiftType === GiftCardType.GIFT && hasCustomerInfo && (
                    <ReceiversSection
                      control={form.control}
                      fields={fields}
                      append={append}
                      remove={remove}
                      form={form}
                      onQuantityChange={(newQuantity) => {
                        if (
                          giftCardItem &&
                          newQuantity !== giftCardItem.quantity
                        ) {
                          updateQuantity(newQuantity)
                        }
                      }}
                      onRecipientsSelectionChange={setHasSelectedRecipients}
                    />
                  )}
                </div>
                {/* Fixed Footer - Total Section */}
                {giftCardItem && (
                  <OrderSummary
                    totalPoints={totalPoints}
                    totalAmount={totalAmount}
                    onCheckout={handleShowConfirmDialog}
                    disabled={
                      !form.formState.isValid ||
                      form.formState.isSubmitting ||
                      !giftCardItem.isActive ||
                      (watchedGiftType === GiftCardType.GIFT &&
                        !hasSelectedRecipients) ||
                      isAllLocked ||
                      !hasCustomerInfo
                    }
                  />
                )}
              </form>
            </Form>
          </div>
        </SheetContent>

        {/* Confirmation Dialog */}
        <ConfirmGiftCardCheckoutDialog
          isOpen={confirmDialogOpen}
          onOpenChange={setConfirmDialogOpen}
          onConfirm={handleConfirmCheckout}
        />
      </Sheet>
    </>
  )
}
