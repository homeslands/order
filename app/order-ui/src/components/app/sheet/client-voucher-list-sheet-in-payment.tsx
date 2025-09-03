import { useEffect, useState, useCallback } from 'react'
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
  useSpecificVoucher,
  useValidateVoucher,
  useVouchersForOrder,
  useUpdateVoucherInOrder,
} from '@/hooks'
import { calculateOrderItemDisplay, calculatePlacedOrderTotals, formatCurrency, isVoucherApplicableToCartItems, showErrorToast, showToast } from '@/utils'
import {
  IValidateVoucherRequest,
  IVoucher,
} from '@/types'
import { useOrderFlowStore, useThemeStore, useUserStore } from '@/stores'
import { APPLICABILITY_RULE, Role, VOUCHER_TYPE } from '@/constants'

export default function VoucherListSheetInPayment({
  onSuccess,
}: {
  onSuccess: () => void
}) {
  const isMobile = useIsMobile()
  const { getTheme } = useThemeStore()
  const { t } = useTranslation(['voucher'])
  const { t: tToast } = useTranslation('toast')
  const { userInfo } = useUserStore()
  const { paymentData } = useOrderFlowStore()
  const { mutate: validateVoucher } = useValidateVoucher()
  const { mutate: updateVoucherInOrder } = useUpdateVoucherInOrder()
  const { pagination } = usePagination()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [localVoucherList, setLocalVoucherList] = useState<IVoucher[]>([])
  const [selectedVoucher, setSelectedVoucher] = useState<string>('')
  const [inputValue, setInputValue] = useState<string>('')

  const paymentMethod = paymentData?.paymentMethod

  const voucher = paymentData?.orderData?.voucher || null
  const orderData = paymentData?.orderData

  // console.log('paymentMethod in voucher list sheet in payment', paymentData)

  const displayItems = calculateOrderItemDisplay(orderData?.orderItems || [], voucher)
  const cartTotals = calculatePlacedOrderTotals(displayItems, voucher)

  const isCustomerOwner =
    sheetOpen &&
    !!orderData?.owner && // Check khác null, undefined, ""
    orderData.owner.role.name === Role.CUSTOMER;

  const { data: voucherList } = useVouchersForOrder(
    isCustomerOwner
      ? {
        isActive: true,
        hasPaging: true,
        page: pagination.pageIndex,
        size: pagination.pageSize,
        paymentMethod: paymentMethod
      }
      : {
        isVerificationIdentity: false,
        isActive: true,
        hasPaging: true,
        page: pagination.pageIndex,
        size: pagination.pageSize,
        paymentMethod: paymentMethod
      },
    !!sheetOpen
  );


  const { data: specificVoucher, refetch: refetchSpecificVoucher } = useSpecificVoucher(
    {
      code: inputValue
    }
  )

  const isVoucherSelected = (voucherSlug: string) => {
    // Nếu user đã chọn voucher mới, chỉ hiển thị voucher đó là selected
    if (selectedVoucher && selectedVoucher !== '') {
      return selectedVoucher === voucherSlug
    }
    // Nếu chưa chọn voucher mới, hiển thị voucher hiện tại của order
    return orderData?.voucher?.slug === voucherSlug
  }

  const handleCompleteSelection = async () => {
    if (!orderData) return

    const orderSlug = orderData.slug

    // Nếu không có voucher nào được chọn, xóa voucher hiện tại nếu có
    if (!selectedVoucher) {
      if (orderData.voucher && orderData.voucher !== null) {
        updateVoucherInOrder({
          slug: orderSlug,
          voucher: null,
          orderItems: orderData.orderItems.map((item) => ({
            quantity: item.quantity,
            variant: item.variant.slug,
            note: item.note,
            promotion: item.promotion ? item.promotion.slug : null,
          }))
        }, {
          onSuccess: () => {
            showToast(tToast('toast.removeVoucherSuccess'))
            setSheetOpen(false)
            onSuccess()
          },
        })
      } else {
        setSheetOpen(false)
      }
      return
    }

    // Tìm voucher được chọn
    const selectedVoucherData = localVoucherList.find(v => v.slug === selectedVoucher)

    if (!selectedVoucherData) {
      showErrorToast(1000)
      return
    }

    // Kiểm tra lại voucher có hợp lệ không trước khi apply
    if (!isVoucherValid(selectedVoucherData)) {
      showToast(t('voucher.notValid'))
      setSelectedVoucher('') // Reset selection
      return
    }

    // Nếu voucher được chọn giống với voucher hiện tại, chỉ đóng sheet
    if (orderData.voucher?.slug === selectedVoucher) {
      setSheetOpen(false)
      return
    }

    // Validate và áp dụng voucher mới
    const validateVoucherParam: IValidateVoucherRequest = {
      voucher: selectedVoucherData.slug,
      user: orderData.owner.slug || userInfo?.slug || '',
      orderItems: orderData.orderItems.map((item) => ({
        quantity: item.quantity,
        variant: item.variant.slug,
        note: item.note,
        promotion: item.promotion ? item.promotion.slug : null,
      }))
    }

    const orderItemsParam = orderData.orderItems.map((item) => ({
      quantity: item.quantity,
      variant: item.variant.slug,
      note: item.note,
      promotion: item.promotion ? item.promotion.slug : null,
    }))

    // Validate voucher trước, sau đó update order
    validateVoucher(validateVoucherParam, {
      onSuccess: () => {
        updateVoucherInOrder({
          slug: orderSlug,
          voucher: selectedVoucherData.slug,
          orderItems: orderItemsParam
        }, {
          onSuccess: () => {
            setSheetOpen(false)
            showToast(tToast('toast.applyVoucherSuccess'))
            onSuccess()
          },
          onError: () => {
            showErrorToast(1000)
          }
        })
      },
      onError: () => {
        showErrorToast(1000)
      }
    })
  }

  // Set initial selected voucher when order has a voucher OR when sheet opens
  useEffect(() => {
    if (sheetOpen) {
      // Reset input value mỗi khi mở sheet
      setInputValue('')

      if (orderData?.voucher && orderData.voucher !== null) {
        const slug = orderData.voucher.slug
        setSelectedVoucher(slug)

        if (orderData.voucher.isPrivate) {
          refetchSpecificVoucher()
        }
      } else {
        setSelectedVoucher('')
      }
    }
  }, [orderData?.voucher, refetchSpecificVoucher, sheetOpen])

  // check if specificVoucher is not null, then set the voucher list to the local voucher list
  useEffect(() => {
    const vouchers = [specificVoucher?.result].filter((v): v is IVoucher => !!v)

    if (vouchers.length > 0) {
      setLocalVoucherList(prevList => {
        const newList = [...(prevList || [])]
        vouchers.forEach(voucher => {
          const existingIndex = newList.findIndex(v => v.slug === voucher.slug)
          if (existingIndex === -1) {
            newList.unshift(voucher)
          }
        })
        return newList
      })

      // Nếu tìm thấy voucher từ input code, tự động select nó
      if (specificVoucher?.result && inputValue.trim() !== '') {
        setSelectedVoucher(specificVoucher.result.slug)
      }
    }
  }, [specificVoucher?.result, inputValue])

  useEffect(() => {
    const baseList = voucherList?.result?.items || []
    let newList = [...baseList]

    // Add specific voucher from search
    if (specificVoucher?.result) {
      const existingIndex = newList.findIndex(v => v.slug === specificVoucher.result.slug)
      if (existingIndex === -1) {
        newList = [specificVoucher.result, ...newList]
      }
    }

    // Add current voucher from order draft if it exists and not already in list
    if (orderData?.voucher) {
      const existingIndex = newList.findIndex(v => v.slug === orderData.voucher!.slug)
      if (existingIndex === -1) {
        newList = [orderData.voucher, ...newList]
      }
    }

    setLocalVoucherList(newList)
  }, [voucherList?.result?.items, specificVoucher?.result, orderData?.voucher])

  // check if voucher is private and user is logged in, then refetch specific voucher
  useEffect(() => {
    if (userInfo && specificVoucher?.result?.isPrivate) {
      refetchSpecificVoucher()
    }
  }, [
    userInfo,
    specificVoucher?.result?.isPrivate,
    refetchSpecificVoucher
  ])

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    showToast(tToast('toast.copyCodeSuccess'))
  }

  const isVoucherValid = useCallback((voucher: IVoucher) => {
    const isValidAmount =
      voucher?.type === VOUCHER_TYPE.SAME_PRICE_PRODUCT
        ? true
        : (voucher?.minOrderValue || 0) <= ((cartTotals?.subTotalBeforeDiscount || 0) - (cartTotals?.promotionDiscount || 0))
    // Check if voucher has voucherProducts and if cart items match
    const hasValidProducts = (() => {
      // If voucher doesn't have voucherProducts or it's empty, return false
      if (!voucher.voucherProducts || voucher.voucherProducts.length === 0) {
        return false
      }

      // If cart is empty, return false
      if (!orderData?.orderItems || orderData.orderItems.length === 0) {
        return false
      }

      // Check if at least one cart item matches voucher products
      const voucherProductSlugs = voucher.voucherProducts.map(vp => vp.product.slug)

      const cartProductSlugs = orderData.orderItems.reduce((acc, item) => {
        if (item.variant.product.slug) acc.push(item.variant.product.slug) // Slug của product
        return acc
      }, [] as string[])
      return isVoucherApplicableToCartItems(
        cartProductSlugs,
        voucherProductSlugs,
        voucher.applicabilityRule
      )
    })()

    const sevenAmToday = moment().set({ hour: 7, minute: 0, second: 0, millisecond: 0 });
    const isValidDate = sevenAmToday.isSameOrBefore(moment(voucher.endDate));
    const requiresLogin = voucher.isVerificationIdentity === true
    const isUserLoggedIn = !!orderData?.owner && orderData.owner.role.name === Role.CUSTOMER
    const isIdentityValid = !requiresLogin || (requiresLogin && isUserLoggedIn)
    return isValidAmount && isValidDate && isIdentityValid && hasValidProducts
  }, [cartTotals, orderData])

  // Auto-deselect voucher if it becomes invalid (out of stock or other conditions)
  useEffect(() => {
    if (selectedVoucher && localVoucherList.length > 0) {
      const currentSelectedVoucher = localVoucherList.find(v => v.slug === selectedVoucher)

      if (currentSelectedVoucher && !isVoucherValid(currentSelectedVoucher)) {
        // Auto-deselect invalid voucher
        setSelectedVoucher('')

        // Show warning notification - use showToast instead of showErrorToast for messages
        if (currentSelectedVoucher.remainingUsage === 0) {
          showToast(t('voucher.outOfStock'))
        } else {
          showToast(t('voucher.becameInvalid'))
        }
      }
    }
  }, [selectedVoucher, localVoucherList, t, isVoucherValid])

  const getVoucherErrorMessage = (voucher: IVoucher) => {
    const cartProductSlugs = orderData?.orderItems?.map((item) => item.variant.product.slug) || []
    const voucherProductSlugs = voucher.voucherProducts?.map((vp) => vp.product.slug) || []

    const allCartProductsInVoucher = cartProductSlugs.every((slug: string) => voucherProductSlugs.includes(slug))
    const hasAnyCartProductInVoucher = cartProductSlugs.some((slug: string) => voucherProductSlugs.includes(slug))

    const subTotalAfterPromotion = (cartTotals?.subTotalBeforeDiscount || 0) - (cartTotals?.promotionDiscount || 0)
    const isCurrentlyApplied = orderData?.voucher?.slug === voucher.slug

    if (voucher.isVerificationIdentity && !isCustomerOwner) {
      return t('voucher.needVerifyIdentity')
    }

    // Không hiển thị "hết số lượng" cho voucher đang được áp dụng
    if (voucher.remainingUsage === 0 && !isCurrentlyApplied) {
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
    const isSelected = isVoucherSelected(voucher.slug)
    const isSelectedButInvalid = isSelected && !isValid
    const isCurrentlyApplied = orderData?.voucher?.slug === voucher.slug

    const baseCardClass = `grid h-40 grid-cols-8 gap-2 p-2 rounded-md sm:h-36 relative
    ${isSelected
        ? isSelectedButInvalid
          ? `bg-destructive/10 border-destructive`
          : `bg-${getTheme() === 'light' ? 'primary/10' : 'black'} border-primary`
        : `${getTheme() === 'light' ? 'bg-white' : 'border'}`
      }
    border border-muted-foreground/50
    ${voucher.remainingUsage === 0 && !isCurrentlyApplied ? 'opacity-50' : ''}
    ${!isValid && !isSelected && !isCurrentlyApplied ? 'opacity-60' : ''}
  `

    // const needsLogin = voucher.isVerificationIdentity && !orderDraft?.ownerPhoneNumber
    // const isVoucherUsable = isVoucherValid(voucher) && !needsLogin


    return (
      <div className={baseCardClass} key={voucher.slug}>
        {/* Overlay mờ cho voucher không hợp lệ - NHƯNG KHÔNG áp dụng cho voucher đang được sử dụng */}
        {!isValid && !isCurrentlyApplied && (
          <div className="absolute inset-0 z-10 rounded-md pointer-events-none bg-muted-foreground/10" />
        )}
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
            <span className="text-xs italic text-destructive">
              {getVoucherErrorMessage(voucher)}
            </span>
          </div>
          <div className="flex gap-2 justify-between items-center">
            <div className="flex flex-col gap-1 w-full">
              <span className="text-xs text-muted-foreground">
                {voucher.remainingUsage === 0 && !isCurrentlyApplied
                  ? <span className="text-xs italic text-destructive">
                    {t('voucher.outOfStock')}
                  </span>
                  : `${t('voucher.remainingUsage')}: ${Math.round(usagePercentage)}%`}
              </span>
              {(voucher.remainingUsage > 0 || isCurrentlyApplied) && (
                <Progress value={usagePercentage} className="h-1" />
              )}
            </div>
            <Checkbox
              id={voucher.slug}
              checked={selectedVoucher === voucher.slug}
              onCheckedChange={(checked) => {
                setSelectedVoucher(checked ? voucher.slug : '')
              }}
              disabled={(!isValid || voucher.remainingUsage === 0) && !isCurrentlyApplied}
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
        <Button variant="ghost" className="px-0 mt-3 w-full bg-primary/15 hover:bg-primary/20">
          <div className="flex gap-3 items-center p-2 w-full rounded-md cursor-pointer">
            <div className="flex gap-1 items-center">
              <TicketPercent className="icon text-primary" />
              <span className="text-xs text-muted-foreground">
                {t('voucher.useVoucher')}
              </span>
            </div>
            {/* {orderDraft?.voucher && (
              <div className="flex justify-start w-full">
                <span className="px-2 py-[0.1rem] text-[0.5rem] xl:text-xs font-semibold text-white rounded-full bg-primary/60">
                  -{`${formatCurrency(orderDraft?.voucher?.value || 0)}`}
                </span>
              </div>
            )} */}
            {/* {orderDraft?.voucher && (
              <div className="flex justify-start w-full">
                <div className="flex gap-2 items-center w-full">
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
              <div className="grid grid-cols-1 gap-2 items-center">
                <div className="relative p-1">
                  <TicketPercent className="absolute left-2 top-1/2 text-gray-400 -translate-y-1/2" />
                  <Input
                    placeholder={t('voucher.enterVoucher')}
                    className="pl-10"
                    onChange={(e) => setInputValue(e.target.value)}
                    value={inputValue}
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
            <Button
              className="w-full"
              onClick={handleCompleteSelection}
              disabled={!!selectedVoucher && localVoucherList.length > 0 &&
                (() => {
                  const selected = localVoucherList.find(v => v.slug === selectedVoucher)
                  return selected ? !isVoucherValid(selected) : false
                })()
              }
            >
              {t('voucher.complete')}
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
