import { useEffect, useState, useRef, useCallback } from 'react'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import {
  ChevronRight,
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
  Badge,
  Checkbox,
} from '@/components/ui'

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
  const [tempSelectedVoucher, setTempSelectedVoucher] = useState<string>('')

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

  // 1. Owner là khách hàng có tài khoản
  const isCustomerOwner =
    !!userInfo &&
    userInfo.role?.name === Role.CUSTOMER &&
    userInfo.phonenumber !== 'default-customer';

  const { data: voucherList } = useVouchersForOrder(
    isCustomerOwner // Nếu owner là khách có tài khoản
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
      setTempSelectedVoucher(cartItems.voucher.slug);

      if (cartItems.voucher.isPrivate) {
        refetchSpecificVoucher();
      }
    } else {
      setTempSelectedVoucher('');
    }
  }, [cartItems?.voucher, refetchSpecificVoucher]);

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

  const handleCompleteSelection = async () => {
    // Nếu không có voucher nào được chọn, chỉ đóng sheet
    if (!tempSelectedVoucher) {
      // Nếu có voucher đang áp dụng, xóa nó
      if (cartItems?.voucher) {
        removeVoucher();
        showToast(tToast('toast.removeVoucherSuccess'));
      }
      setSheetOpen(false);
      return;
    }

    // Tìm voucher được chọn
    const selectedVoucherData = localVoucherList.find(v => v.slug === tempSelectedVoucher);

    if (!selectedVoucherData) {
      showErrorToast(1000);
      return;
    }

    // Nếu voucher được chọn giống với voucher hiện tại, chỉ đóng sheet
    if (cartItems?.voucher?.slug === tempSelectedVoucher) {
      setSheetOpen(false);
      return;
    }

    // Validate và áp dụng voucher mới
    const validateVoucherParam: IValidateVoucherRequest = {
      voucher: selectedVoucherData.slug,
      user: userInfo?.slug || '',
      orderItems: cartItems?.orderItems.map(item => ({
        quantity: item.quantity,
        variant: item.variant.slug,
        note: item.note,
        promotion: item.promotion ? item.promotion.slug : null,
        order: null,
      })) || []
    }

    const onValidated = () => {
      addVoucher(selectedVoucherData);
      setSheetOpen(false);
      showToast(tToast('toast.applyVoucherSuccess'));
    }

    if (userInfo?.slug) {
      validateVoucher(validateVoucherParam, { onSuccess: onValidated })
    } else {
      validatePublicVoucher(validateVoucherParam, { onSuccess: onValidated })
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
    const expiryText = (endDate: string) => {
      const now = moment()
      const end = moment.utc(endDate).local() // Convert UTC to local timezone
      const diff = moment.duration(end.diff(now))

      if (diff.asSeconds() <= 0) {
        // Hết hạn thì fix cứng 0h 0m
        return t('voucher.expiresInHoursMinutes', { hours: 0, minutes: 0 })
      }

      if (diff.asHours() < 24) {
        // Dưới 24h: hiển thị "X giờ Y phút"
        const hours = Math.floor(diff.asHours())
        const minutes = Math.floor(diff.asMinutes()) % 60
        return t('voucher.expiresInHoursMinutes', { hours, minutes })
      }

      // Từ 24h trở lên: hiển thị "X ngày Y giờ Z phút"
      const days = Math.floor(diff.asDays())
      const hours = Math.floor(diff.asHours()) % 24
      const minutes = Math.floor(diff.asMinutes()) % 60
      return t('voucher.expiresInDaysHoursMinutes', { days, hours, minutes })
    }

    const isValid = isVoucherValid(voucher)
    const baseCardClass = `grid h-40 grid-cols-8 gap-2 p-2 rounded-md sm:h-36 relative
    ${isVoucherSelected(voucher.slug)
        ? `bg-${getTheme() === 'light' ? 'primary/10' : 'black'} border-primary`
        : `${getTheme() === 'light' ? 'bg-white' : 'border'}`
      }
    border border-muted-foreground/50
    ${voucher.remainingUsage === 0 ? 'opacity-50' : ''}
    ${!isValid ? 'opacity-60' : ''}
  `

    return (
      <div className={baseCardClass} key={voucher.slug}>
        {/* Overlay mờ cho voucher không hợp lệ */}
        {!isValid && (
          <div className="absolute inset-0 z-10 rounded-md pointer-events-none bg-muted-foreground/10" />
        )}
        {/* {isBest && (
          <div className="absolute -top-0 -left-0 px-2 py-1 text-xs text-white rounded-tl-md rounded-br-md bg-primary">
            {t('voucher.bestChoice')}
          </div>
        )} */}
        <div
          className={`flex col-span-2 justify-center items-center w-full rounded-md bg-primary`}
        >
          <Ticket size={56} className="text-white" />
        </div>
        <div className="flex flex-col col-span-6 justify-between w-full">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-muted-foreground">
              {voucher.title}
            </span>
            <span className="text-xs text-muted-foreground/80">
              {t('voucher.minOrderValue')}: {formatCurrency(voucher.minOrderValue)}
            </span>
            {/* <span className="text-xs italic text-primary">
              {(() => {
                const { type, value, applicabilityRule: rule } = voucher

                const discountValueText =
                  type === VOUCHER_TYPE.PERCENT_ORDER
                    ? t('voucher.percentDiscount', { value })
                    : type === VOUCHER_TYPE.SAME_PRICE_PRODUCT
                      ? t('voucher.samePriceProduct', { value: formatCurrency(value) })
                      : t('voucher.fixedDiscount', { value: formatCurrency(value) })

                const ruleText =
                  rule === APPLICABILITY_RULE.ALL_REQUIRED
                    ? t(
                      type === VOUCHER_TYPE.SAME_PRICE_PRODUCT
                        ? 'voucher.requireAllSamePrice'
                        : 'voucher.requireAll'
                    )
                    : t(
                      type === VOUCHER_TYPE.SAME_PRICE_PRODUCT
                        ? 'voucher.requireAtLeastOneSamePrice'
                        : 'voucher.requireAtLeastOne'
                    )

                return `${discountValueText} ${ruleText}`
              })()}
            </span> */}
            {/* <span className="flex gap-1 items-center text-sm text-muted-foreground">
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
            </span> */}
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
          <div className="flex gap-2 justify-between items-center">
            <div className="flex flex-col gap-1 w-full">
              <span className="text-xs text-muted-foreground">
                {voucher.remainingUsage === 0
                  ? <span className="text-xs italic text-destructive">
                    {t('voucher.outOfStock')}
                  </span>
                  : `${t('voucher.remainingUsage')}: ${Math.round(usagePercentage)}%`}
              </span>
              {voucher.remainingUsage > 0 && (
                <Progress value={usagePercentage} className="h-1" />
              )}
            </div>
            <Checkbox
              id={voucher.slug}
              checked={tempSelectedVoucher === voucher.slug}
              onCheckedChange={(checked) => {
                setTempSelectedVoucher(checked ? voucher.slug : '')
              }}
              disabled={!isValid || voucher.remainingUsage === 0}
              className="w-5 h-5 rounded-full"
            />
          </div>
          <div className="flex gap-2 items-center w-full">
            <Badge variant="outline" className="text-xs font-normal truncate text-primary border-primary w-fit">
              {expiryText(voucher.endDate)}
            </Badge>
            {!isMobile ? (
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs font-thin text-muted-foreground/80">
                      {t('voucher.condition')}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className={`w-[18rem] p-4 bg-${getTheme() === 'light' ? 'white' : 'black'} rounded-md text-muted-foreground shadow-md`}
                  >
                    <div className="flex flex-col gap-4 justify-between">
                      <div className="grid grid-cols-5">
                        <span className="col-span-2 text-muted-foreground/70">
                          {t('voucher.code')}
                        </span>
                        <span className="flex col-span-3 gap-1 items-center">
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
                          {moment(voucher.endDate).format('HH:mm DD/MM/YYYY')}
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
                  <span className="text-xs font-thin text-muted-foreground/80">
                    {t('voucher.condition')}
                  </span>
                </PopoverTrigger>
                <PopoverContent
                  className={`mr-2 w-[20rem] p-4 bg-${getTheme() === 'light' ? 'white' : 'black'} rounded-md text-muted-foreground shadow-md`}
                >
                  <div className="flex flex-col gap-4 justify-between text-xs sm:text-sm">
                    <div className="grid grid-cols-5">
                      <span className="col-span-2 text-muted-foreground/70">
                        {t('voucher.code')}
                      </span>
                      <span className="flex col-span-3 gap-1 items-center">
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
                        {moment(voucher.endDate).format('HH:mm DD/MM/YYYY')}
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
          </div>
        </div>
      </div>
    )
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="px-0 w-full bg-primary/15 hover:bg-primary/20">
          <div className="flex gap-1 justify-between items-center p-2 w-full rounded-md cursor-pointer">
            <div className="flex gap-1 items-center">
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
              <div className="grid grid-cols-1 gap-2">
                <div className="relative p-1">
                  <TicketPercent className="absolute left-2 top-1/2 text-gray-400 -translate-y-1/2" />
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
              <div className="flex justify-between items-center py-4">
                <Label className="text-md text-muted-foreground">
                  {t('voucher.list')}
                </Label>
                <span className="text-xs text-muted-foreground">
                  {t('voucher.maxApply')}: 1
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 pb-4">
                {localVoucherList && localVoucherList.length > 0 ? (
                  (() => {
                    // Sắp xếp voucher: hợp lệ trước, không hợp lệ sau
                    const validVouchers = localVoucherList.filter(voucher => isVoucherValid(voucher))
                    const invalidVouchers = localVoucherList.filter(voucher => !isVoucherValid(voucher))

                    return (
                      <>
                        {/* Voucher hợp lệ */}
                        {validVouchers.length > 0 ? (
                          validVouchers.map((voucher) =>
                            renderVoucherCard(voucher)
                          )
                        ) : (
                          <div className="py-4 text-center text-muted-foreground">
                            {t('voucher.noVoucher')}
                          </div>
                        )}

                        {/* Voucher không khả dụng */}
                        {invalidVouchers.length > 0 && (
                          <>
                            <div className="flex items-center py-2 mt-4">
                              <Label className="text-sm text-muted-foreground/70">
                                {t('voucher.invalidVoucher')}
                              </Label>
                            </div>
                            {invalidVouchers.map((voucher) =>
                              renderVoucherCard(voucher)
                            )}
                          </>
                        )}
                      </>
                    )
                  })()
                ) : (
                  <div>{t('voucher.noVoucher')}</div>
                )}
              </div>
            </div>
          </ScrollArea>
          <SheetFooter className="p-4">
            <Button className="w-full" onClick={handleCompleteSelection}>
              {t('voucher.complete')}
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
