import { useEffect, useState, useRef, useCallback } from 'react'
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
  useValidatePublicVoucher,
  useValidateVoucher,
  useVouchersForOrder,
} from '@/hooks'
import { calculateCartItemDisplay, calculateCartTotals, formatCurrency, isVoucherApplicableToCartItems, showErrorToast, showToast } from '@/utils'
import {
  IValidateVoucherRequest,
  IVoucher,
} from '@/types'
import { useOrderFlowStore, useThemeStore, useUserStore } from '@/stores'
import { APPLICABILITY_RULE, Role, VOUCHER_TYPE } from '@/constants'

export default function VoucherListSheet() {
  const isMobile = useIsMobile()
  const { getTheme } = useThemeStore()
  const { t } = useTranslation(['voucher'])
  const { t: tToast } = useTranslation('toast')
  const { userInfo } = useUserStore()
  const { getCartItems, addVoucher, removeVoucher, isHydrated } = useOrderFlowStore()
  const isRemovingVoucherRef = useRef(false)
  // const { cartItems, addVoucher, removeVoucher, isHydrated } = useCartItemStore()
  const { mutate: validateVoucher } = useValidateVoucher()
  const { mutate: validatePublicVoucher } = useValidatePublicVoucher()
  const { pagination } = usePagination()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [localVoucherList, setLocalVoucherList] = useState<IVoucher[]>([])
  const [selectedVoucher, setSelectedVoucher] = useState<string>('')

  const cartItems = getCartItems()
  // Add useEffect to check voucher validation
  const isVoucherSelected = useCallback((voucherSlug: string) => {
    return (
      cartItems?.voucher?.slug === voucherSlug ||
      selectedVoucher === voucherSlug
    )
  }, [cartItems?.voucher?.slug, selectedVoucher])
  useEffect(() => {
    if (cartItems?.voucher) {
      // If user is not logged in but voucher requires verification
      if (!userInfo && cartItems?.voucher.isVerificationIdentity) {
        showErrorToast(1003) // Show error toast
        removeVoucher() // Remove invalid voucher
      }
    }
  }, [userInfo, cartItems?.voucher, removeVoucher, getCartItems])

  const isCustomerOwner =
    sheetOpen &&
    !!cartItems?.owner && // Check khác null, undefined, ""
    cartItems.ownerRole === Role.CUSTOMER;

  const { data: voucherList } = useVouchersForOrder(
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
  const { data: publicVoucherList } = usePublicVouchersForOrder(
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

  const handleToggleVoucher = useCallback((voucher: IVoucher) => {
    const isSelected = isVoucherSelected(voucher.slug)

    const handleRemove = () => {
      removeVoucher()
      setSelectedVoucher('')
      showToast(tToast('toast.removeVoucherSuccess'))
    }

    const handleApply = () => {
      addVoucher(voucher)
      setSelectedVoucher(voucher.slug)
      setSheetOpen(false)
      showToast(tToast('toast.applyVoucherSuccess'))
    }

    const validateVoucherParam: IValidateVoucherRequest = {
      voucher: voucher.slug,
      user: userInfo?.slug || '',
      orderItems: cartItems?.orderItems.map(item => ({
        quantity: item.quantity,
        variant: item.variant.slug,
        note: item.note,
        promotion: item.promotion ? item.promotion.slug : null,
        order: null, // hoặc bỏ nếu không cần
      })) || []
    }


    const onSuccess = () => handleApply()
    // const onError = () => handleRemove()

    if (isSelected) {
      handleRemove()
    } else {
      if (userInfo && voucher?.isVerificationIdentity) {
        validateVoucher(validateVoucherParam, { onSuccess })
      } else {
        validatePublicVoucher(validateVoucherParam, { onSuccess })
      }
    }
  }, [removeVoucher, addVoucher, setSelectedVoucher, setSheetOpen, tToast, userInfo, validateVoucher, validatePublicVoucher, cartItems, isVoucherSelected])

  // Auto-check voucher validity when orderItems change
  useEffect(() => {
    if (!cartItems?.voucher || !cartItems?.orderItems || isRemovingVoucherRef.current) {
      isRemovingVoucherRef.current = false
      return
    }

    const { voucher, orderItems } = cartItems
    const voucherProductSlugs = voucher.voucherProducts?.map(vp => vp.product.slug) || []
    const cartProductSlugs = orderItems.map(item => item.productSlug || item.slug)

    // Tổng tiền gốc (sau promotion nhưng chưa áp voucher)
    const subtotalBeforeVoucher = orderItems.reduce((acc, item) => {
      const original = item.originalPrice
      const promotionDiscount = item.promotionDiscount ?? 0
      return acc + ((original ?? 0) - promotionDiscount) * item.quantity
    }, 0)

    let shouldRemove = false

    switch (voucher.applicabilityRule) {
      case APPLICABILITY_RULE.ALL_REQUIRED: {
        const hasInvalidProducts = cartProductSlugs.some(slug => !voucherProductSlugs.includes(slug))
        if (hasInvalidProducts) shouldRemove = true
        break
      }
      case APPLICABILITY_RULE.AT_LEAST_ONE_REQUIRED: {
        const hasAtLeastOne = cartProductSlugs.some(slug => voucherProductSlugs.includes(slug))
        if (!hasAtLeastOne) shouldRemove = true
        break
      }
      default:
        break
    }

    // Check minOrderValue (trừ type SAME_PRICE_PRODUCT)
    if (!shouldRemove && voucher.type !== VOUCHER_TYPE.SAME_PRICE_PRODUCT) {
      if (subtotalBeforeVoucher < (voucher.minOrderValue || 0)) {
        shouldRemove = true
      }
    }

    // Remove voucher nếu cần
    if (shouldRemove) {
      isRemovingVoucherRef.current = true
      handleToggleVoucher(voucher)
    }

  }, [cartItems, cartItems?.orderItems, cartItems?.voucher, handleToggleVoucher])


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
    const isCustomer = userInfo?.role.name === Role.CUSTOMER || (!userInfo && cartItems?.owner !== '' && cartItems?.ownerRole === Role.CUSTOMER)

    const baseList = (isCustomer ? voucherList?.result.items : publicVoucherList?.result.items) || []

    let newList = [...baseList]

    if (userInfo && specificVoucher?.result) {
      const existingIndex = newList.findIndex(v => v.slug === specificVoucher.result.slug)
      if (existingIndex === -1) {
        newList = [specificVoucher.result, ...newList]
      }
    }

    if (!userInfo && specificPublicVoucher?.result) {
      const existingIndex = newList.findIndex(v => v.slug === specificPublicVoucher.result.slug)
      if (existingIndex === -1) {
        newList = [specificPublicVoucher.result, ...newList]
      }
    }

    setLocalVoucherList(newList)
  }, [userInfo, voucherList?.result?.items, publicVoucherList?.result?.items, specificVoucher?.result, specificPublicVoucher?.result, cartItems?.ownerRole, selectedVoucher, cartItems?.owner])

  useEffect(() => {
    if (cartItems?.voucher) {
      const code = cartItems.voucher.code;
      setSelectedVoucher(code);

      if (cartItems.voucher.isPrivate) {
        refetchSpecificVoucher();
      }
    }
  }, [cartItems?.voucher, refetchSpecificVoucher]);


  // useEffect(() => {
  //   if (defaultValue?.voucher?.slug) {
  //     setSelectedVoucher(defaultValue.voucher.slug)
  //   } else {
  //     setSelectedVoucher('')
  //   }
  // }, [defaultValue?.voucher?.slug, sheetOpen])

  // If cartItems is not hydrated, return null
  if (!isHydrated) {
    // eslint-disable-next-line no-console
    console.warn('Cart items are not hydrated yet.')
    return null
  }

  // let subTotal = 0
  const voucher = cartItems?.voucher || null
  // calculate subtotal
  const displayItems = calculateCartItemDisplay(cartItems, voucher)
  const cartTotals = calculateCartTotals(displayItems, voucher)
  // const subTotal = cartItems?.orderItems.reduce((acc, item) => acc + (item.originalPrice || 0) * item.quantity, 0) || 0

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    showToast(tToast('toast.copyCodeSuccess'))
  }

  // Filter and sort vouchers to get the best one
  // const getBestVoucher = () => {
  //   if (!Array.isArray(localVoucherList)) {
  //     return null
  //   }

  //   const currentDate = new Date()

  //   const validVouchers = localVoucherList
  //     .filter((voucher) => {
  //       const isValid = voucher.isActive &&
  //         moment(currentDate).isSameOrAfter(moment(voucher.startDate)) &&
  //         moment(currentDate).isSameOrBefore(moment(voucher.endDate)) &&
  //         voucher.remainingUsage > 0 &&
  //         (!userInfo ? voucher.isVerificationIdentity === false : true)
  //       return isValid
  //     })
  //     .sort((a, b) => {
  //       const endDateDiff = new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
  //       if (endDateDiff !== 0) return endDateDiff
  //       if (a.minOrderValue !== b.minOrderValue) {
  //         return a.minOrderValue - b.minOrderValue
  //       }
  //       return b.value - a.value
  //     })

  //   return validVouchers.length > 0 ? validVouchers[0] : null
  // }

  // const bestVoucher = getBestVoucher()



  // const handleToggleVoucher = (voucher: IVoucher) => {
  //   const isSelected = isVoucherSelected(voucher.slug)

  //   const handleRemove = () => {
  //     removeVoucher()
  //     setSelectedVoucher('')
  //     showToast(tToast('toast.removeVoucherSuccess'))
  //   }

  //   const handleApply = () => {
  //     addVoucher(voucher)
  //     setSelectedVoucher(voucher.slug)
  //     setSheetOpen(false)
  //     showToast(tToast('toast.applyVoucherSuccess'))
  //   }

  //   const validateVoucherParam: IValidateVoucherRequest = {
  //     voucher: voucher.slug,
  //     user: userInfo?.slug || '',
  //     orderItems: cartItems?.orderItems.map(item => ({
  //       quantity: item.quantity,
  //       variant: item.variant.slug,
  //       note: item.note,
  //       promotion: item.promotion ?? null,
  //       order: null, // hoặc bỏ nếu không cần
  //     })) || []
  //   }


  //   const onSuccess = () => handleApply()
  //   // const onError = () => handleRemove()

  //   if (isSelected) {
  //     handleRemove()
  //   } else {
  //     if (userInfo && voucher?.isVerificationIdentity) {
  //       validateVoucher(validateVoucherParam, { onSuccess })
  //     } else {
  //       validatePublicVoucher(validateVoucherParam, { onSuccess })
  //     }
  //   }
  // }

  const handleApplyVoucher = async () => {
    if (!selectedVoucher) return;

    if (userInfo) {
      const { data } = await refetchSpecificVoucher();
      const voucher = data?.result;

      if (voucher) {
        const validateVoucherParam: IValidateVoucherRequest = {
          voucher: voucher.slug,
          user: userInfo?.slug || '',
          orderItems: cartItems?.orderItems.map(item => ({
            quantity: item.quantity,
            variant: item.variant.slug,
            note: item.note,
            promotion: item.promotion ? item.promotion.slug : null,
            order: null, // hoặc bỏ nếu không cần
          })) || []
        }


        const onValidated = () => {
          addVoucher(voucher);
          setSheetOpen(false);
          showToast(tToast('toast.applyVoucherSuccess'));
        }

        if (userInfo) {
          validateVoucher(validateVoucherParam, { onSuccess: onValidated })
        } else {
          validatePublicVoucher(validateVoucherParam, { onSuccess: onValidated })
        }

      } else {
        showErrorToast(1000);
      }
    } else {
      const { data } = await refetchSpecificPublicVoucher(); // Gọi fetch thủ công
      const publicVoucher = data?.result;

      if (publicVoucher) {
        const validateVoucherParam: IValidateVoucherRequest = {
          voucher: publicVoucher.slug,
          user: '', // điền user slug nếu có
          orderItems: cartItems?.orderItems.map(item => ({
            quantity: item.quantity,
            variant: item.variant.slug,
            note: item.note,
            promotion: item.promotion ? item.promotion.slug : null,
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
    const isValidAmount =
      voucher?.type === VOUCHER_TYPE.SAME_PRICE_PRODUCT
        ? true
        : (voucher?.minOrderValue || 0) <= ((cartTotals?.subTotalBeforeDiscount || 0) - (cartTotals?.promotionDiscount || 0))
    const sevenAmToday = moment().set({ hour: 7, minute: 0, second: 0, millisecond: 0 });
    const isValidDate = sevenAmToday.isSameOrBefore(moment(voucher.endDate))

    const requiresLogin = voucher.isVerificationIdentity === true
    const isUserLoggedIn = !!userInfo?.slug

    const isIdentityValid = !requiresLogin || (requiresLogin && isUserLoggedIn)

    const hasValidProducts = (() => {
      if (!voucher.voucherProducts || voucher.voucherProducts.length === 0) {
        return false
      }

      if (!cartItems?.orderItems || cartItems.orderItems.length === 0) {
        return false
      }

      const voucherProductSlugs = voucher.voucherProducts.map(vp => vp.product.slug)

      const cartProductSlugs = cartItems.orderItems.reduce((acc, item) => {
        if (item.slug) acc.push(item.slug) // Slug của product
        return acc
      }, [] as string[])

      return isVoucherApplicableToCartItems(
        cartProductSlugs,
        voucherProductSlugs,
        voucher.applicabilityRule
      )
    })()

    return isValidAmount && isValidDate && isIdentityValid && hasValidProducts
  }

  const getVoucherErrorMessage = (voucher: IVoucher) => {
    const cartProductSlugs = cartItems?.orderItems?.map((item) => item.slug) || []
    const voucherProductSlugs = voucher.voucherProducts?.map((vp) => vp.product?.slug) || []

    const allCartProductsInVoucher = cartProductSlugs.every(slug => voucherProductSlugs.includes(slug))
    const hasAnyCartProductInVoucher = cartProductSlugs.some(slug => voucherProductSlugs.includes(slug))

    const subTotalAfterPromotion = (cartTotals?.subTotalBeforeDiscount || 0) - (cartTotals?.promotionDiscount || 0)

    if (voucher.isVerificationIdentity && !isCustomerOwner) {
      return t('voucher.needVerifyIdentity')
    }

    if (voucher.remainingUsage === 0) {
      return t('voucher.outOfStock')
    }

    if (moment(voucher.endDate).isBefore(moment().set({ hour: 7, minute: 0, second: 0, millisecond: 0 }))) {
      return t('voucher.expired')
    }

    if (
      voucher.type !== VOUCHER_TYPE.SAME_PRICE_PRODUCT &&
      voucher.minOrderValue > subTotalAfterPromotion
    ) {
      return t('voucher.minOrderNotMet')
    }

    // 💡 Bổ sung lỗi theo applicabilityRule
    if (voucher.voucherProducts?.length > 0) {
      if (
        voucher.applicabilityRule === APPLICABILITY_RULE.ALL_REQUIRED &&
        !allCartProductsInVoucher
      ) {
        return t('voucher.requireOnlyApplicableProducts')
      }

      if (
        voucher.applicabilityRule === APPLICABILITY_RULE.AT_LEAST_ONE_REQUIRED &&
        !hasAnyCartProductInVoucher
      ) {
        return t('voucher.requireSomeApplicableProducts')
      }
    }

    return ''
  }

  const renderVoucherCard = (voucher: IVoucher) => {
    const usagePercentage = (voucher.remainingUsage / voucher.maxUsage) * 100
    const baseCardClass = `grid h-48 grid-cols-8 gap-2 p-2 rounded-md sm:h-44 relative
    ${isVoucherSelected(voucher.slug)
        ? `bg-${getTheme() === 'light' ? 'primary/10' : 'black'} border-primary`
        : `${getTheme() === 'light' ? 'bg-white' : 'border'}`
      }
    border border-muted-foreground/50
    ${voucher.remainingUsage === 0 ? 'opacity-50' : ''}
  `

    return (
      <div className={baseCardClass} key={voucher.slug}>
        {/* {isBest && (
          <div className="absolute px-2 py-1 text-xs text-white -top-0 -left-0 rounded-tl-md rounded-br-md bg-primary">
            {t('voucher.bestChoice')}
          </div>
        )} */}
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
                {voucher.value}% {t('voucher.forSelectedProducts')}
              </span>
            ) : voucher.type === VOUCHER_TYPE.SAME_PRICE_PRODUCT ? (
              <span className="text-xs italic text-primary">
                {t('voucher.samePrice')} {formatCurrency(voucher.value)} {t('voucher.forSelectedProducts')}
              </span>
            ) : (
              <span className="text-xs italic text-primary">
                {t('voucher.discountValue')}
                {formatCurrency(voucher.value)} {t('voucher.forSelectedProducts')}
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
            <span className="text-xs italic text-destructive">
              {getVoucherErrorMessage(voucher)}
              {/* {voucher?.type !== VOUCHER_TYPE.SAME_PRICE_PRODUCT && voucher?.minOrderValue > subTotal
                ? t('voucher.minOrderNotMet')
                : moment(voucher.endDate).isBefore(moment().set({ hour: 7, minute: 0, second: 0, millisecond: 0 }))
                  ? t('voucher.expired')
                  : voucher.isVerificationIdentity && !userInfo?.slug
                    ? t('voucher.needVerifyIdentity')
                    : ''} */}
            </span>
            <span className="hidden text-muted-foreground/60 sm:text-xs">
              {t('voucher.minOrderValue')}: {formatCurrency(voucher.minOrderValue)}
            </span>
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {voucher.remainingUsage === 0
                  ? <span className="text-xs italic text-destructive">
                    {t('voucher.outOfStock')}
                  </span>
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
              disabled={voucher.remainingUsage === 0}
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
              <span className="text-sm text-primary">
                {t('voucher.useVoucher')}
              </span>
            </div>
            <div>
              <ChevronRight className="icon text-primary" />
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
                      // bestVoucher?.slug === voucher.slug,
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
