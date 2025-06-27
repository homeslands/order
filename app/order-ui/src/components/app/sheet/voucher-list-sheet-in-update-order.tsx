import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import {
  ChevronRight,
  CircleHelp,
  Copy,
  Ticket,
  TicketPercent,
} from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Button,
  ScrollArea,
  Input,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Label,
  SheetFooter,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Progress,
} from '@/components/ui'
import VoucherNotValid from '@/assets/images/chua-thoa-dieu-kien.svg'
import {
  useIsMobile,
  usePagination,
  usePublicVouchersForOrder,
  useSpecificPublicVoucher,
  useSpecificVoucher,
  useUpdateVoucherInOrder,
  useValidatePublicVoucher,
  useValidateVoucher,
  useVouchersForOrder,
} from '@/hooks'
import { calculateOrderItemDisplay, calculatePlacedOrderTotals, formatCurrency, showErrorToast, showToast } from '@/utils'
import {
  IOrder,
  IValidateVoucherRequest,
  IVoucher,
} from '@/types'
import { useCartItemStore, useThemeStore, useUserStore } from '@/stores'
import { Role, VOUCHER_TYPE } from '@/constants'

interface IVoucherListSheetInUpdateOrderProps {
  defaultValue?: IOrder | undefined
  onSuccess?: () => void
}

export default function VoucherListSheetInUpdateOrder({
  defaultValue,
  onSuccess,
}: IVoucherListSheetInUpdateOrderProps) {
  const isMobile = useIsMobile()
  const { getTheme } = useThemeStore()
  const { t } = useTranslation(['voucher'])
  const { t: tToast } = useTranslation('toast')
  const { userInfo } = useUserStore()
  const { cartItems, addVoucher, removeVoucher } = useCartItemStore()
  const { mutate: validateVoucher } = useValidateVoucher()
  const { mutate: validatePublicVoucher } = useValidatePublicVoucher()
  const { mutate: updateVoucherInOrder } = useUpdateVoucherInOrder()
  const { pagination } = usePagination()
  const [sheetOpen, setSheetOpen] = useState(false)
  const queryClient = useQueryClient()
  const [localVoucherList, setLocalVoucherList] = useState<IVoucher[]>([])
  const [selectedVoucher, setSelectedVoucher] = useState<string>('')
  const [appliedVoucher, setAppliedVoucher] = useState<string>('')

  const orderItems = defaultValue?.orderItems || []
  const voucher = defaultValue?.voucher || null

  const displayItems = calculateOrderItemDisplay(orderItems, voucher)
  const cartTotals = calculatePlacedOrderTotals(displayItems, voucher)

  // const subTotal = cartItems?.orderItems.reduce((acc, item) => acc + (item.originalPrice || 0) * item.quantity, 0) || 0
  // console.log('subTotal', subTotal)

  // const subTotal = defaultValue?.orderItems.reduce((acc, item) => {
  //   const price = item.variant.price;
  //   const quantity = item.quantity;
  //   const discount = item.promotion ? item.promotion.value : 0;

  //   const itemTotal = price * quantity * (1 - discount / 100);
  //   return acc + itemTotal;
  // }, 0) || 0;

  // Add useEffect to check voucher validation
  useEffect(() => {
    if (cartItems?.voucher) {
      // If user is logged in but voucher doesn't require verification
      // if (userInfo && !cartItems.voucher.isVerificationIdentity) {
      //   showErrorToast(1003) // Show error toast
      //   removeVoucher() // Remove invalid voucher
      // }
      // If user is not logged in but voucher requires verification
      if (!userInfo && cartItems.voucher.isVerificationIdentity) {
        // console.log('cartItems.voucher', cartItems.voucher)
        showErrorToast(1003) // Show error toast
        removeVoucher() // Remove invalid voucher
      }
    }
  }, [userInfo, cartItems?.voucher, removeVoucher])

  const isCustomerOwner =
    sheetOpen &&
    !!defaultValue?.owner && // Check khác null, undefined, ""
    defaultValue?.owner?.role?.name === Role.CUSTOMER &&
    defaultValue?.owner?.phonenumber !== 'default-customer';

  const { data: voucherList, refetch: refetchVoucherList } = useVouchersForOrder(
    isCustomerOwner
      ? {
        isActive: true,
        hasPaging: true,
        page: pagination.pageIndex,
        size: pagination.pageSize,
      }
      : undefined,
    !!sheetOpen
  )
  const { data: publicVoucherList, refetch: refetchPublicVoucherList } = usePublicVouchersForOrder(
    !isCustomerOwner
      ? {
        isActive: true,
        hasPaging: true,
        page: pagination.pageIndex,
        size: pagination.pageSize,
      }
      : undefined,
    !!sheetOpen
  )

  const { data: specificVoucher, refetch: refetchSpecificVoucher } = useSpecificVoucher(
    {
      code: selectedVoucher
    }
  )

  const { data: specificPublicVoucher, refetch: refetchSpecificPublicVoucher } = useSpecificPublicVoucher(
    {
      code: selectedVoucher
    },
  )

  // check if defaultValue?.voucher is null, then set the voucher list to the local voucher list
  useEffect(() => {
    if (!defaultValue?.voucher) {
      setLocalVoucherList(voucherList?.result?.items || [])
      setSelectedVoucher('')
      setAppliedVoucher('')
    }
  }, [defaultValue?.voucher, voucherList?.result?.items])

  // check if voucher is private, then refetch specific voucher, then set the voucher list to the local voucher list
  useEffect(() => {
    if (specificVoucher?.result?.isPrivate) {
      refetchSpecificVoucher()
    }
  }, [specificVoucher?.result?.isPrivate, refetchSpecificVoucher])

  // check if voucher is private and user is logged in, then refetch specific voucher
  useEffect(() => {
    if (userInfo && specificVoucher?.result?.isPrivate) {
      refetchSpecificVoucher();
    } else if (!userInfo && specificPublicVoucher?.result) {
      refetchSpecificPublicVoucher();
    }
  }, [
    userInfo,
    specificVoucher?.result?.isPrivate,
    specificPublicVoucher?.result,
    refetchSpecificVoucher,
    refetchSpecificPublicVoucher
  ]);

  // check if specificVoucher or specificPublicVoucher is not null, then set the voucher list to the local voucher list
  useEffect(() => {
    const vouchers = userInfo
      ? [specificVoucher?.result].filter((v): v is IVoucher => !!v)
      : [specificPublicVoucher?.result].filter((v): v is IVoucher => !!v);

    if (vouchers.length > 0) {
      setLocalVoucherList(prevList => {
        const newList = [...(prevList || [])];
        vouchers.forEach(voucher => {
          const existingIndex = newList.findIndex(v => v.slug === voucher.slug);
          if (existingIndex === -1) {
            newList.unshift(voucher);
          }
        });
        return newList;
      });
    }
  }, [userInfo, specificVoucher?.result, specificPublicVoucher?.result]);

  useEffect(() => {
    if (defaultValue?.voucher) {
      const code = defaultValue.voucher.code;
      setSelectedVoucher(code);
    }
  }, [defaultValue?.voucher]);

  useEffect(() => {
    const baseList = (userInfo ? voucherList?.result.items : publicVoucherList?.result.items) || []
    let newList = [...baseList]

    // Add specific voucher to list if it exists and isn't already in the list
    if (userInfo && specificVoucher?.result) {
      const existingIndex = newList.findIndex(v => v.slug === specificVoucher.result.slug)
      if (existingIndex === -1 && specificVoucher.result.code === selectedVoucher) {
        newList = [specificVoucher.result, ...newList]
      }
    }

    if (!userInfo && specificPublicVoucher?.result) {
      const existingIndex = newList.findIndex(v => v.slug === specificPublicVoucher.result.slug)
      if (existingIndex === -1 && specificPublicVoucher.result.code === selectedVoucher) {
        newList = [specificPublicVoucher.result, ...newList]
      }
    }

    // Always keep the currently applied voucher in the list, use useEffect to check if the voucher is not in the list, then add it to the list
    if (defaultValue?.voucher) {
      const appliedVoucherIndex = newList.findIndex(v => v.slug === defaultValue.voucher?.slug)
      if (appliedVoucherIndex === -1) {
        newList = [defaultValue.voucher, ...newList]
      }
    }

    setLocalVoucherList(newList)
  }, [userInfo, voucherList?.result?.items, publicVoucherList?.result?.items, specificVoucher?.result, specificPublicVoucher?.result, defaultValue?.voucher, selectedVoucher])

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    showToast(tToast('toast.copyCodeSuccess'))
  }

  // Filter and sort vouchers to get the best one
  const getBestVoucher = () => {
    if (!Array.isArray(localVoucherList)) {
      return null
    }

    const currentDate = new Date()

    const validVouchers = localVoucherList
      .filter((voucher) => {
        const isValid = voucher.isActive &&
          moment(currentDate).isSameOrAfter(moment(voucher.startDate)) &&
          moment(currentDate).isSameOrBefore(moment(voucher.endDate)) &&
          voucher.remainingUsage > 0 &&
          (!userInfo ? voucher.isVerificationIdentity === false : true)
        return isValid
      })
      .sort((a, b) => {
        const endDateDiff = new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
        if (endDateDiff !== 0) return endDateDiff
        if (a.minOrderValue !== b.minOrderValue) {
          return a.minOrderValue - b.minOrderValue
        }
        return b.value - a.value
      })

    return validVouchers.length > 0 ? validVouchers[0] : null
  }


  const bestVoucher = getBestVoucher()

  const isVoucherSelected = (voucherSlug: string) => {
    // Nếu đang trong chế độ update order
    if (defaultValue) {
      return defaultValue.voucher?.slug === voucherSlug
    }
    // Nếu đang trong chế độ tạo order mới
    return cartItems?.voucher?.slug === voucherSlug || selectedVoucher === voucherSlug
  }

  const handleToggleVoucher = (voucher: IVoucher) => {
    const isSelected = isVoucherSelected(voucher.slug)
    const applyMessage = tToast('toast.applyVoucherSuccess')
    const removeMessage = tToast('toast.removeVoucherSuccess')

    const handleApplySuccess = (message: string, shouldCloseSheet = true) => {
      if (shouldCloseSheet) setSheetOpen(false)
      showToast(message)
      onSuccess?.()
      setAppliedVoucher('')
    }

    const orderItemsParam = orderItems.map(item => ({
      quantity: item.quantity,
      variant: item.variant.slug,
      note: item.note,
      promotion: item.promotion?.slug || null,
      order: defaultValue?.slug || null
    }))

    // Nếu đang bỏ chọn
    if (isSelected) {
      if (defaultValue) {
        updateVoucherInOrder(
          { slug: defaultValue.slug, voucher: null, orderItems: orderItemsParam },
          {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: ['orders'] })
              setSelectedVoucher('')
              handleApplySuccess(removeMessage, false)
            },
          },
        )
      } else {
        removeVoucher()
        setSelectedVoucher('')
        // showToast(removeMessage)
      }
      return
    }

    // Đang chọn voucher mới → luôn validate
    const validateVoucherParam: IValidateVoucherRequest = {
      voucher: voucher.slug,
      user: userInfo?.slug || '',
      orderItems: orderItemsParam || []
    }

    const onValidated = () => {
      if (defaultValue) {
        updateVoucherInOrder(
          { slug: defaultValue.slug, voucher: voucher.slug, orderItems: orderItemsParam },
          {
            onSuccess: () => {
              if (userInfo) {
                refetchVoucherList()
                setLocalVoucherList(voucherList?.result?.items || [])
              } else {
                refetchPublicVoucherList()
                setLocalVoucherList(publicVoucherList?.result?.items || [])
              }
              queryClient.invalidateQueries({ queryKey: ['orders'] })
              setSelectedVoucher(voucher.slug)
              handleApplySuccess(applyMessage)
            },
          },
        )
      } else {
        addVoucher(voucher)
        setSelectedVoucher(voucher.slug)
        handleApplySuccess(applyMessage)
      }
    }

    if (userInfo) {
      validateVoucher(validateVoucherParam, { onSuccess: onValidated })
    } else {
      validatePublicVoucher(validateVoucherParam, { onSuccess: onValidated })
    }
  }

  const handleApplyVoucher = async () => {
    if (!selectedVoucher) return;

    if (appliedVoucher) {
      // removeVoucher()
      setAppliedVoucher('')
      return
    }

    if (userInfo) {
      const { data } = await refetchSpecificVoucher();
      const voucher = data?.result;

      if (voucher) {
        const validateVoucherParam: IValidateVoucherRequest = {
          voucher: voucher.slug,
          user: '', // điền user slug nếu có
          orderItems: cartItems?.orderItems.map(item => ({
            quantity: item.quantity,
            variant: item.variant.slug,
            note: item.note,
            promotion: item.promotion ?? null,
            order: null, // hoặc bỏ nếu không cần
          })) || []
        }

        validateVoucher(validateVoucherParam, {
          onSuccess: () => {
            addVoucher(voucher);
            setSheetOpen(false);
            showToast(tToast('toast.applyVoucherSuccess'));
          },
        });
      } else {
        showErrorToast(1000);
      }
    } else {
      const { data } = await refetchSpecificPublicVoucher();
      const publicVoucher = data?.result;

      if (publicVoucher) {
        const validateVoucherParam: IValidateVoucherRequest = {
          voucher: publicVoucher.slug,
          user: '', // điền user slug nếu có
          orderItems: cartItems?.orderItems.map(item => ({
            quantity: item.quantity,
            variant: item.variant.slug,
            note: item.note,
            promotion: item.promotion ?? null,
            order: null, // hoặc bỏ nếu không cần
          })) || []
        }



        validatePublicVoucher(validateVoucherParam, {
          onSuccess: () => {
            addVoucher(publicVoucher);
            setSheetOpen(false);
            showToast(tToast('toast.applyVoucherSuccess'));
          },
        });
      } else {
        showErrorToast(1000);
      }
    }
  };

  const isVoucherValid = (voucher: IVoucher) => {
    // console.log('isVoucherValid', voucher, orderItems)
    const isValidAmount =
      voucher?.type === VOUCHER_TYPE.SAME_PRICE_PRODUCT
        ? true
        : (voucher?.minOrderValue || 0) <= (cartTotals?.subTotalBeforeDiscount || 0)
    // Check if voucher has voucherProducts and if cart items match
    const hasValidProducts = (() => {
      // If voucher doesn't have voucherProducts or it's empty, return false
      if (!voucher.voucherProducts || voucher.voucherProducts.length === 0) {
        return false
      }

      // If cart is empty, return false
      if (!orderItems || orderItems.length === 0) {
        return false
      }

      // Check if at least one cart item matches voucher products
      const voucherProductSlugs = voucher.voucherProducts.map(vp => vp.product.slug)
      const cartProductSlugs = orderItems.map(item => item?.variant?.product?.slug)

      return voucherProductSlugs.some(voucherSlug =>
        cartProductSlugs.includes(voucherSlug)
      )
    })()
    const isRemainingUsage = voucher.remainingUsage > 0
    const sevenAmToday = moment().set({ hour: 7, minute: 0, second: 0, millisecond: 0 });
    const isValidDate = sevenAmToday.isSameOrBefore(moment(voucher.endDate))
    const isRequiredLogin = voucher.isVerificationIdentity
    const isUserLoggedIn = !!userInfo
    const isIdentityValid = !isRequiredLogin || (isRequiredLogin && isUserLoggedIn)
    return isValidAmount && isValidDate && isRemainingUsage && isIdentityValid && hasValidProducts
  }

  const renderVoucherCard = (voucher: IVoucher, isBest: boolean) => {
    const usagePercentage = (voucher.remainingUsage / voucher.maxUsage) * 100
    const baseCardClass = `grid h-44 grid-cols-8 gap-2 p-2 rounded-md sm:h-44 relative
    ${isVoucherSelected(voucher.slug)
        ? `bg-${getTheme() === 'light' ? 'primary/10' : 'black'} border-primary`
        : `${getTheme() === 'light' ? 'bg-white' : 'border'}`
      }
    border border-muted-foreground/50
    ${voucher.remainingUsage === 0 && !isVoucherSelected(voucher.slug) ? 'opacity-50' : ''}
  `

    return (
      <div className={baseCardClass} key={voucher.slug}>
        {isBest && (
          <div className="absolute px-2 py-1 text-xs text-white -top-0 -left-0 rounded-tl-md rounded-br-md bg-primary">
            {t('voucher.bestChoice')}
          </div>
        )}
        <div
          className={`col-span-2 flex w-full items-center justify-center rounded-md ${isVoucherSelected(voucher.slug) ? `bg-${getTheme() === 'light' ? 'white' : 'black'}` : 'bg-muted-foreground/10'}`}
        >
          <Ticket size={56} className="text-primary" />
        </div>
        <div className="flex flex-col justify-between w-full col-span-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground sm:text-sm">
              {voucher.title}
            </span>
            {voucher.type === VOUCHER_TYPE.PERCENT_ORDER ? (
              <span className="text-xs italic text-primary">
                {t('voucher.discountValue')}
                {voucher.value}% {t('voucher.orderValue')}
              </span>
            ) : voucher.type === VOUCHER_TYPE.SAME_PRICE_PRODUCT ? (
              <span className="text-xs italic text-primary">
                {t('voucher.samePrice')} {formatCurrency(voucher.value)} {t('voucher.forSelectedProducts')}
              </span>
            ) : (
              <span className="text-xs italic text-primary">
                {t('voucher.discountValue')}
                {formatCurrency(voucher.value)} {t('voucher.orderValue')}
              </span>
            )}
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              {voucher.code}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6"
                      onClick={() => handleCopyCode(voucher?.code)}
                    >
                      <Copy className="w-4 h-4 text-primary" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('voucher.copyCode')}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
            <span className="text-xs text-destructive">
              {voucher.isVerificationIdentity && !userInfo
                ? t('voucher.needVerifyIdentity')
                : voucher.remainingUsage === 0
                  ? t('voucher.outOfStock')
                  : moment(voucher.endDate).isBefore(moment().set({ hour: 7, minute: 0, second: 0, millisecond: 0 }))
                    ? t('voucher.expired')
                    : voucher?.type !== VOUCHER_TYPE.SAME_PRICE_PRODUCT && voucher.minOrderValue > (cartTotals?.subTotalBeforeDiscount || 0)
                      ? t('voucher.minOrderNotMet')
                      : ''}
            </span>
            <span className="hidden text-muted-foreground/60 sm:text-xs">
              {t('voucher.applyForOrderValueFrom')} {formatCurrency(voucher.minOrderValue)}
            </span>
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {voucher.remainingUsage === 0
                  ? t('voucher.outOfStock')
                  : `${t('voucher.remainingUsage')}: ${voucher.remainingUsage}/${voucher.maxUsage}`}
              </span>
            </div>
            {voucher.remainingUsage > 0 && (
              <Progress value={usagePercentage} className="h-1" />
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {t('voucher.endDate')}:{' '}
            {moment(voucher.endDate).format('DD/MM/YYYY')}
          </span>
        </div>
        <div className="flex flex-col items-end justify-between col-span-2">
          {!isMobile ? (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 p-2 text-muted-foreground"
                  >
                    <CircleHelp />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className={`w-[18rem] p-4 bg-${getTheme() === 'light' ? 'white' : 'black'} rounded-md text-muted-foreground shadow-md`}
                >
                  <div className="flex flex-col justify-between gap-4">
                    <div className="grid grid-cols-5">
                      <span className="col-span-2 text-muted-foreground/70">
                        {t('voucher.code')}
                      </span>
                      <span className="flex items-center col-span-3 gap-1">
                        {voucher.code}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-4 h-4"
                          onClick={() => handleCopyCode(voucher?.code)}
                        >
                          <Copy className="w-4 h-4 text-primary" />
                        </Button>
                      </span>
                    </div>
                    <div className="grid grid-cols-5">
                      <span className="col-span-2 text-muted-foreground/70">
                        {t('voucher.endDate')}
                      </span>
                      <span className="col-span-3">
                        {moment(voucher.endDate).format('DD/MM/YYYY')}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground/70">
                        {t('voucher.condition')}
                      </span>
                      <ul className="col-span-3 pl-4 list-disc">
                        <li>
                          {t('voucher.minOrderValue')}:{' '}
                          {formatCurrency(voucher.minOrderValue)}
                        </li>
                        {voucher.isVerificationIdentity && (
                          <li>
                            {t('voucher.needVerifyIdentity')}
                          </li>
                        )}
                        {voucher.numberOfUsagePerUser && (
                          <li>
                            {t('voucher.numberOfUsagePerUser')}:{' '}
                            {voucher.numberOfUsagePerUser}
                          </li>
                        )}
                        {voucher.voucherProducts && voucher.voucherProducts.length > 0 && (
                          <li>
                            {t('voucher.products')}: {voucher.voucherProducts.map(vp => vp.product.name).join(', ')}
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 p-2 text-muted-foreground"
                >
                  <CircleHelp />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className={`mr-2 w-[20rem] p-4 bg-${getTheme() === 'light' ? 'white' : 'black'} rounded-md text-muted-foreground shadow-md`}
              >
                <div className="flex flex-col justify-between gap-4">
                  <div className="grid grid-cols-5">
                    <span className="col-span-2 text-muted-foreground/70">
                      {t('voucher.code')}
                    </span>
                    <span className="flex items-center col-span-3 gap-1">
                      {voucher.code}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-4 h-4"
                        onClick={() => handleCopyCode(voucher?.code)}
                      >
                        <Copy className="w-4 h-4 text-primary" />
                      </Button>
                    </span>
                  </div>
                  <div className="grid grid-cols-5">
                    <span className="col-span-2 text-muted-foreground/70">
                      {t('voucher.endDate')}
                    </span>
                    <span className="col-span-3">
                      {moment(voucher.endDate).format('DD/MM/YYYY')}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground/70">
                      {t('voucher.condition')}
                    </span>
                    <ul className="col-span-3 pl-4 list-disc">
                      <li>
                        {t('voucher.minOrderValue')}:{' '}
                        {formatCurrency(voucher.minOrderValue)}
                      </li>
                      {voucher.isVerificationIdentity && (
                        <li>
                          {t('voucher.needVerifyIdentity')}
                        </li>
                      )}
                      {voucher.numberOfUsagePerUser && (
                        <li>
                          {t('voucher.numberOfUsagePerUser')}:{' '}
                          {voucher.numberOfUsagePerUser}
                        </li>
                      )}
                      {voucher.voucherProducts && voucher.voucherProducts.length > 0 && (
                        <li>
                          {t('voucher.products')}: {voucher.voucherProducts.map(vp => vp.product.name).join(', ')}
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
          {isVoucherValid(voucher) ? (
            <Button
              onClick={() => handleToggleVoucher(voucher)}
              variant={
                isVoucherSelected(voucher.slug) ? 'destructive' : 'default'
              }
            >
              {isVoucherSelected(voucher.slug)
                ? t('voucher.remove')
                : t('voucher.use')}
            </Button>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <img
                src={VoucherNotValid}
                alt="chua-thoa-dieu-kien"
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="w-full px-0 bg-primary/15 hover:bg-primary/20">
          <div className="flex items-center justify-between w-full gap-1 p-2 rounded-md cursor-pointer">
            <div className="flex items-center gap-1">
              <TicketPercent className="icon text-primary" />
              <span className="text-xs text-muted-foreground">
                {t('voucher.useVoucher')}
              </span>
            </div>
            <div>
              <ChevronRight className="icon text-muted-foreground" />
            </div>
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader className="p-4">
          <SheetTitle className="text-primary">{t('voucher.list')}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full bg-transparent backdrop-blur-md">
          <ScrollArea
            className={`max-h-[calc(100vh-8rem)] flex-1 gap-4 p-4 bg-${getTheme() === 'light' ? 'white' : 'black'}`}
          >
            {/* Voucher search */}
            <div className="flex flex-col flex-1">
              <div className="grid items-center grid-cols-4 gap-2 sm:grid-cols-5">
                <div className="relative col-span-3 p-1 sm:col-span-4">
                  <TicketPercent className="absolute text-gray-400 -translate-y-1/2 left-2 top-1/2" />
                  <Input
                    placeholder={t('voucher.enterVoucher')}
                    className="pl-10"
                    onChange={(e) => setSelectedVoucher(e.target.value)}
                    value={selectedVoucher}
                  />
                </div>
                <Button
                  className="col-span-1"
                  disabled={!selectedVoucher}
                  onClick={handleApplyVoucher}
                >
                  {t('voucher.apply')}
                </Button>
              </div>
            </div>
            {/* Voucher list */}
            <div>
              <div className="flex items-center justify-between py-4">
                <Label className="text-md text-muted-foreground">
                  {t('voucher.list')}
                </Label>
                <span className="text-xs text-muted-foreground">
                  {t('voucher.maxApply')}: 1
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 pb-4">
                {localVoucherList && localVoucherList.length > 0 ? (
                  localVoucherList?.map((voucher) =>
                    renderVoucherCard(
                      voucher,
                      bestVoucher?.slug === voucher.slug,
                    ),
                  )
                ) : (
                  <div>{t('voucher.noVoucher')}</div>
                )}
              </div>
            </div>
          </ScrollArea>
          <SheetFooter className="p-4">
            <Button className="w-full" onClick={() => setSheetOpen(false)}>
              {t('voucher.complete')}
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
