import { useEffect, useState } from 'react'
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
  useSpecificVoucher,
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

export default function StaffVoucherListSheet() {
  const isMobile = useIsMobile()
  const { getTheme } = useThemeStore()
  const { t } = useTranslation(['voucher'])
  const { t: tToast } = useTranslation('toast')
  const { userInfo } = useUserStore()
  const { getCartItems, addVoucher, removeVoucher } = useOrderFlowStore()
  const { getUserInfo } = useUserStore()
  const { mutate: validateVoucher } = useValidateVoucher()
  const { pagination } = usePagination()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [localVoucherList, setLocalVoucherList] = useState<IVoucher[]>([])
  const [selectedVoucher, setSelectedVoucher] = useState<string>('')
  const [appliedVoucher, setAppliedVoucher] = useState<string>('')

  const cartItems = getCartItems()

  const voucher = cartItems?.voucher || null

  const displayItems = calculateCartItemDisplay(cartItems, voucher)
  const cartTotals = calculateCartTotals(displayItems, voucher)

  // let subTotal = 0
  // calculate subtotal
  // const subTotal = cartItems?.orderItems.reduce((acc, item) => acc + (item.originalPrice || 0) * item.quantity, 0) || 0
  // const subTotal = cartItems?.orderItems.reduce(
  //   (acc, item) => acc + item.price * item.quantity,
  //   0,
  // ) || 0

  // calculate discount base on voucher type, voucher value and subtotal
  // const discount = cartItems?.voucher?.type === VOUCHER_TYPE.PERCENT_ORDER
  //   ? subTotal * cartItems?.voucher?.value / 100
  //   : cartItems?.voucher?.value

  const isCustomerOwner =
    sheetOpen &&
    !!cartItems?.owner && // Check khác null, undefined, ""
    cartItems.ownerRole === Role.CUSTOMER;

  // const { cartWithVoucher, itemLevelDiscount } = useMemo(() => {
  //   const { cart: cartWithVoucher, itemLevelDiscount } = applyVoucherToCart(cartItems)
  //   const calculations = calculateCartTotals(cartWithVoucher, itemLevelDiscount)

  //   return { cartWithVoucher, itemLevelDiscount, calculations }
  // }, [
  //   cartItems,
  // ])

  const { data: voucherList } = useVouchersForOrder(
    isCustomerOwner
      ? {
        isActive: true,
        hasPaging: true,
        page: pagination.pageIndex,
        size: pagination.pageSize,
      }
      : {
        isVerificationIdentity: false,
        isActive: true,
        hasPaging: true,
        page: pagination.pageIndex,
        size: pagination.pageSize,
      },
    !!sheetOpen
  );


  const { data: specificVoucher, refetch: refetchSpecificVoucher } = useSpecificVoucher(
    {
      code: selectedVoucher
    }
  )

  // check if specificVoucher or specificPublicVoucher is not null, then set the voucher list to the local voucher list
  useEffect(() => {
    const vouchers = [specificVoucher?.result].filter((v): v is IVoucher => !!v)

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
  }, [userInfo, specificVoucher?.result]);

  useEffect(() => {
    const baseList = (userInfo ? voucherList?.result.items : []) || []
    let newList = [...baseList]

    if (userInfo && specificVoucher?.result) {
      const existingIndex = newList.findIndex(v => v.slug === specificVoucher.result.slug)
      if (existingIndex === -1) {
        newList = [specificVoucher.result, ...newList]
      }
    }


    setLocalVoucherList(newList)
  }, [userInfo, voucherList?.result?.items, specificVoucher?.result])

  useEffect(() => {
    if (cartItems?.voucher) {
      const code = cartItems.voucher.code;
      setSelectedVoucher(code);
      setAppliedVoucher(cartItems.voucher.slug);

      if (cartItems.voucher.isPrivate) {
        refetchSpecificVoucher();
      }
    } else {
      // Clear selected and applied voucher when cart voucher is removed
      setSelectedVoucher('');
      setAppliedVoucher('');
    }
  }, [cartItems?.voucher, refetchSpecificVoucher]);

  // check if voucher is private and user is logged in, then refetch specific voucher
  useEffect(() => {
    if (userInfo && specificVoucher?.result?.isPrivate) {
      refetchSpecificVoucher();
    }
  }, [
    userInfo,
    specificVoucher?.result?.isPrivate,
    refetchSpecificVoucher
  ]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    showToast(tToast('toast.copyCodeSuccess'))
  }

  const isVoucherValid = (voucher: IVoucher) => {
    const isValidAmount =
      voucher?.type === VOUCHER_TYPE.SAME_PRICE_PRODUCT
        ? true
        : (voucher?.minOrderValue || 0) <= ((cartTotals?.subTotalBeforeDiscount || 0) - (cartTotals?.promotionDiscount || 0))
    const isActive = voucher.isActive
    // Check if voucher has voucherProducts and if cart items match
    const hasValidProducts = (() => {
      // If voucher doesn't have voucherProducts or it's empty, return false
      if (!voucher.voucherProducts || voucher.voucherProducts.length === 0) {
        return false
      }

      // If cart is empty, return false
      if (!cartItems?.orderItems || cartItems.orderItems.length === 0) {
        return false
      }

      // Check if at least one cart item matches voucher products
      // const voucherProductSlugs = voucher.voucherProducts.map(vp => vp.product.slug)
      // const cartProductSlugs = cartItems.orderItems.map(item => item.slug)

      const voucherProductSlugs = voucher.voucherProducts.map(vp => vp.product.slug)
      const cartProductSlugs = cartItems.orderItems.map(item => item.slug)

      const hasValidProducts = isVoucherApplicableToCartItems(cartProductSlugs, voucherProductSlugs, voucher.applicabilityRule)

      return hasValidProducts


      // return voucherProductSlugs.some(voucherSlug =>
      //   cartProductSlugs.includes(voucherSlug)
      // )
    })()
    const sevenAmToday = moment().set({ hour: 7, minute: 0, second: 0, millisecond: 0 });
    const isValidDate = sevenAmToday.isSameOrBefore(moment(voucher.endDate));
    const requiresLogin = voucher.isVerificationIdentity === true
    const isUserLoggedIn = !!cartItems?.owner && cartItems.ownerRole === Role.CUSTOMER
    const isIdentityValid = !requiresLogin || (requiresLogin && isUserLoggedIn)
    return isActive && isValidAmount && isValidDate && isIdentityValid && hasValidProducts
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

  const isVoucherSelected = (voucherSlug: string) => {
    return (
      cartItems?.voucher?.slug === voucherSlug ||
      // selectedVoucher === voucherSlug
      appliedVoucher === voucherSlug
    )
  }

  const handleToggleVoucher = (voucher: IVoucher) => {
    if (cartItems) {
      if (isVoucherSelected(voucher.slug)) {
        // Remove voucher
        removeVoucher()
        setAppliedVoucher('')
        setSelectedVoucher('')
        showToast(tToast('toast.removeVoucherSuccess'))
      } else {
        // Apply voucher
        const validateVoucherParam: IValidateVoucherRequest = {
          voucher: voucher.slug,
          user: cartItems.owner || getUserInfo()?.slug || '',
          orderItems: cartItems?.orderItems.map(item => ({
            quantity: item.quantity,
            variant: item.variant.slug,
            note: item.note,
            promotion: item.promotion ?? null,
            order: null, // hoặc bỏ nếu không cần
          })) || []
        }

        if (voucher.isVerificationIdentity && !cartItems.owner) {
          showErrorToast(1004) // Show error if voucher requires verification but no owner
          return
        }
        validateVoucher(validateVoucherParam, {
          onSuccess: () => {
            addVoucher(voucher)
            setAppliedVoucher(voucher.slug)
            setSelectedVoucher(voucher.code)
            setSheetOpen(false)
            showToast(tToast('toast.applyVoucherSuccess'))
          },
        })
      }
    }
  }

  // const handleApplyVoucher = async () => {
  //   if (!selectedVoucher) return;

  //   if (appliedVoucher) {
  //     removeVoucher()
  //     setAppliedVoucher('')
  //     return
  //   }

  //   if (cartItems?.ownerPhoneNumber) {
  //     const { data } = await refetchSpecificVoucher();
  //     const voucher = data?.result;

  //     if (voucher) {
  //       const validateVoucherParam: IValidateVoucherRequest = {
  //         voucher: voucher.slug,
  //         user: cartItems?.owner || '',
  //       };

  //       validateVoucher(validateVoucherParam, {
  //         onSuccess: () => {
  //           addVoucher(voucher);
  //           setSheetOpen(false);
  //           showToast(tToast('toast.applyVoucherSuccess'));
  //         },
  //       });
  //     } else {
  //       showErrorToast(1000);
  //     }
  //   } else {
  //     const { data } = await refetchSpecificVoucher();
  //     const publicVoucher = data?.result;

  //     if (publicVoucher) {
  //       const validateVoucherParam: IValidateVoucherRequest = {
  //         voucher: publicVoucher.slug,
  //         user: '',
  //       };

  //       validatePublicVoucher(validateVoucherParam, {
  //         onSuccess: () => {
  //           addVoucher(publicVoucher);
  //           setSheetOpen(false);
  //           showToast(tToast('toast.applyVoucherSuccess'));
  //         },
  //       });
  //     } else {
  //       showErrorToast(1000);
  //     }
  //   }
  // };

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
              {getVoucherErrorMessage(voucher)}
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
                          <li className="text-destructive">
                            {t('voucher.isVerificationIdentity')}
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
                <div className="flex flex-col justify-between gap-4 text-[10px] sm:text-sm">
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
                    <ul className="col-span-3 pl-4 list-disc text-destructive">
                      <li>
                        {t('voucher.minOrderValue')}:{' '}
                        {formatCurrency(voucher.minOrderValue)}
                      </li>
                      {voucher.isVerificationIdentity && (
                        <li className="text-destructive">
                          {t('voucher.isVerificationIdentity')}
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
        <Button variant="ghost" className="w-full px-0 mt-3 bg-primary/15 hover:bg-primary/20">
          <div className="flex items-center w-full gap-3 p-2 rounded-md cursor-pointer">
            <div className="flex items-center gap-1">
              <TicketPercent className="icon text-primary" />
              <span className="text-xs text-muted-foreground">
                {t('voucher.useVoucher')}
              </span>
            </div>
            {/* {cartItems?.voucher && (
              <div className="flex justify-start w-full">
                <span className="px-2 py-[0.1rem] text-[0.5rem] xl:text-xs font-semibold text-white rounded-full bg-primary/60">
                  -{`${formatCurrency(cartItems?.voucher?.value || 0)}`}
                </span>
              </div>
            )} */}
            {/* {cartItems?.voucher && (
              <div className="flex justify-start w-full">
                <div className="flex items-center w-full gap-2">
                  <span className="px-2 py-[0.1rem] text-[0.5rem] xl:text-xs font-semibold text-white rounded-full bg-primary/60">
                    -{`${formatCurrency(discount || 0)}`}
                  </span>
                </div>
              </div>
            )} */}
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
              {/* <div className="grid items-center grid-cols-4 gap-2 sm:grid-cols-5">
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
              </div> */}
              <div className="grid items-center grid-cols-1 gap-2">
                <div className="relative p-1">
                  <TicketPercent className="absolute text-gray-400 -translate-y-1/2 left-2 top-1/2" />
                  <Input
                    placeholder={t('voucher.enterVoucher')}
                    className="pl-10"
                    onChange={(e) => setSelectedVoucher(e.target.value)}
                    value={selectedVoucher}
                  />
                </div>
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
                    renderVoucherCard(voucher),
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
