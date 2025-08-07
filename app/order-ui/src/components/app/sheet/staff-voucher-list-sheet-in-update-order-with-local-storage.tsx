import { useCallback, useEffect, useState, useRef } from 'react'
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
  useUpdateVoucherInOrder,
} from '@/hooks'
import { calculateCartItemDisplay, calculateCartTotals, formatCurrency, isVoucherApplicableToCartItems, showErrorToast, showToast } from '@/utils'
import {
  IValidateVoucherRequest,
  IVoucher,
} from '@/types'
import { useOrderFlowStore, useThemeStore, useUserStore } from '@/stores'
import { APPLICABILITY_RULE, Role, VOUCHER_TYPE } from '@/constants'

export default function StaffVoucherListSheetInUpdateOrderWithLocalStorage() {
  const isMobile = useIsMobile()
  const { getTheme } = useThemeStore()
  const { t } = useTranslation(['voucher'])
  const { t: tToast } = useTranslation('toast')
  const { userInfo } = useUserStore()
  const { updatingData, setDraftVoucher, removeDraftVoucher } = useOrderFlowStore()
  const { getUserInfo } = useUserStore()
  const { mutate: validateVoucher } = useValidateVoucher()
  const { mutate: updateVoucherInOrder } = useUpdateVoucherInOrder()
  const { pagination } = usePagination()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [localVoucherList, setLocalVoucherList] = useState<IVoucher[]>([])
  const [selectedVoucher, setSelectedVoucher] = useState<string>('')
  const [appliedVoucher, setAppliedVoucher] = useState<string>('')
  const [removedVouchers, setRemovedVouchers] = useState<IVoucher[]>([])
  const isRemovingVoucherRef = useRef(false)

  const voucher = updatingData?.updateDraft?.voucher || null
  const orderDraft = updatingData?.updateDraft

  // Create a temporary cart item for calculation
  const tempCartItem = orderDraft ? {
    orderItems: orderDraft.orderItems || [],
    voucher: voucher,
    // Add other required properties for ICartItem
    id: orderDraft.id || '',
    slug: orderDraft.slug || '',
    owner: orderDraft.owner || '',
    ownerFullName: orderDraft.ownerFullName || '',
    ownerPhoneNumber: orderDraft.ownerPhoneNumber || '',
    ownerRole: orderDraft.ownerRole || '',
    type: orderDraft.type as string,
    table: orderDraft.table || '',
    tableName: orderDraft.tableName || '',
    description: orderDraft.description || '',
    approvalBy: orderDraft.approvalBy || '',
    paymentMethod: orderDraft.paymentMethod || '',
    payment: undefined
  } : null

  const displayItems = calculateCartItemDisplay(tempCartItem, voucher)
  const cartTotals = calculateCartTotals(displayItems, voucher)

  const isCustomerOwner =
    sheetOpen &&
    !!orderDraft?.owner && // Check khác null, undefined, ""
    orderDraft.ownerRole === Role.CUSTOMER;

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

  // Helper functions for voucher management
  const addVoucher = useCallback((voucher: IVoucher) => {
    setDraftVoucher(voucher)
  }, [setDraftVoucher])

  const removeVoucher = useCallback(() => {
    removeDraftVoucher()
  }, [removeDraftVoucher])

  const isVoucherSelected = useCallback((voucherSlug: string) => {
    return (
      orderDraft?.voucher?.slug === voucherSlug ||
      // selectedVoucher === voucherSlug
      appliedVoucher === voucherSlug
    )
  }, [orderDraft?.voucher?.slug, appliedVoucher])

  const handleToggleVoucher = useCallback((voucher: IVoucher) => {
    if (!orderDraft || !updatingData?.originalOrder) return

    const orderSlug = updatingData.originalOrder.slug
    const isRemoving = isVoucherSelected(voucher.slug)

    if (isRemoving) {
      // Remove voucher - Update store immediately
      removeVoucher()
      setAppliedVoucher('')
      setSelectedVoucher('')

      // Add removed voucher to removedVouchers list to keep it available for reselection
      setRemovedVouchers(prev => {
        const existingIndex = prev.findIndex(v => v.slug === voucher.slug)
        if (existingIndex === -1) {
          return [voucher, ...prev]
        }
        return prev
      })

      // Call API to update order with null voucher
      updateVoucherInOrder({
        slug: orderSlug,
        voucher: null,
        orderItems: orderDraft.orderItems.map(item => ({
          quantity: item.quantity,
          variant: item.variant.slug,
          note: item.note,
          promotion: item.promotion ? item.promotion.slug : null,
        }))
      }, {
        onSuccess: () => {
          showToast(tToast('toast.removeVoucherSuccess'))
        },
        onError: () => {
          // Rollback store changes on error
          addVoucher(voucher)
          setAppliedVoucher(voucher.slug)
          setSelectedVoucher(voucher.code)
          setRemovedVouchers(prev => prev.filter(v => v.slug !== voucher.slug))
          showErrorToast(1000)
        }
      })
    } else {
      // Apply voucher - Check verification first
      if (voucher.isVerificationIdentity && !orderDraft.owner) {
        showErrorToast(1004) // Show error if voucher requires verification but no owner
        return
      }

      // Update store immediately
      addVoucher(voucher)
      setAppliedVoucher(voucher.slug)
      setSelectedVoucher(voucher.code)

      // Remove from removedVouchers list since it's now applied
      setRemovedVouchers(prev => prev.filter(v => v.slug !== voucher.slug))

      // Prepare parameters for validation and API calls
      const orderItemsParam = orderDraft.orderItems.map(item => ({
        quantity: item.quantity,
        variant: item.variant.slug,
        note: item.note,
        promotion: item.promotion ? item.promotion.slug : null,
      }))

      const validateVoucherParam: IValidateVoucherRequest = {
        voucher: voucher.slug,
        user: orderDraft.owner || getUserInfo()?.slug || '',
        orderItems: orderItemsParam
      }

      // Call both validate and update API in parallel
      Promise.all([
        new Promise((resolve, reject) => {
          validateVoucher(validateVoucherParam, {
            onSuccess: resolve,
            onError: reject
          })
        }),
        new Promise((resolve, reject) => {
          updateVoucherInOrder({
            slug: orderSlug,
            voucher: voucher.slug,
            orderItems: orderItemsParam
          }, {
            onSuccess: resolve,
            onError: reject
          })
        })
      ]).then(() => {
        setSheetOpen(false)
        showToast(tToast('toast.applyVoucherSuccess'))
      }).catch(() => {
        // Rollback store changes on error
        removeVoucher()
        setAppliedVoucher('')
        setSelectedVoucher('')
        setRemovedVouchers(prev => {
          const existingIndex = prev.findIndex(v => v.slug === voucher.slug)
          if (existingIndex === -1) {
            return [voucher, ...prev]
          }
          return prev
        })
        showErrorToast(1000)
      })
    }
  }, [orderDraft, updatingData?.originalOrder, isVoucherSelected, setAppliedVoucher, setSelectedVoucher, setRemovedVouchers, tToast, validateVoucher, updateVoucherInOrder, addVoucher, removeVoucher, getUserInfo])

  // Auto-check voucher validity when orderItems change
  useEffect(() => {
    if (!orderDraft?.voucher || !orderDraft?.orderItems || isRemovingVoucherRef.current) {
      isRemovingVoucherRef.current = false
      return
    }

    const { voucher, orderItems } = orderDraft
    const voucherProductSlugs = voucher.voucherProducts?.map(vp => vp.product.slug) || []
    const cartProductSlugs = orderItems.map(item => item.variant.product.slug)

    // Tính tổng tiền sau promotion nhưng chưa áp voucher
    const subtotalBeforeVoucher = orderItems.reduce((acc, item) => {
      const original = item.originalPrice || 0
      const promotionDiscount = item.promotionDiscount || 0
      return acc + (original - promotionDiscount) * item.quantity
    }, 0)

    let shouldRemove = false

    // Check applicability rule
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
  }, [orderDraft, handleToggleVoucher]) // Trigger when orderItems change

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

    // Add specific voucher from search
    if (userInfo && specificVoucher?.result) {
      const existingIndex = newList.findIndex(v => v.slug === specificVoucher.result.slug)
      if (existingIndex === -1) {
        newList = [specificVoucher.result, ...newList]
      }
    }

    // Add current voucher from order draft if it exists and not already in list
    if (orderDraft?.voucher) {
      const existingIndex = newList.findIndex(v => v.slug === orderDraft.voucher!.slug)
      if (existingIndex === -1) {
        newList = [orderDraft.voucher, ...newList]
      }
    }

    // Add removed vouchers back to list so user can reselect them
    removedVouchers.forEach(removedVoucher => {
      const existingIndex = newList.findIndex(v => v.slug === removedVoucher.slug)
      if (existingIndex === -1) {
        newList.push(removedVoucher)
      }
    })

    setLocalVoucherList(newList)
  }, [userInfo, voucherList?.result?.items, specificVoucher?.result, orderDraft?.voucher, removedVouchers])

  useEffect(() => {
    if (orderDraft?.voucher) {
      const code = orderDraft.voucher.code;
      setSelectedVoucher(code);
      setAppliedVoucher(orderDraft.voucher.slug);

      if (orderDraft.voucher.isPrivate) {
        refetchSpecificVoucher();
      }
    } else {
      // Clear selected and applied voucher when cart voucher is removed
      setSelectedVoucher('');
      setAppliedVoucher('');
    }
  }, [orderDraft?.voucher, refetchSpecificVoucher]);

  // Auto-fetch current voucher when sheet opens if it's private
  useEffect(() => {
    if (sheetOpen && orderDraft?.voucher?.isPrivate && orderDraft.voucher.code) {
      setSelectedVoucher(orderDraft.voucher.code);
      refetchSpecificVoucher();
    }
  }, [sheetOpen, orderDraft?.voucher, refetchSpecificVoucher]);

  // Clear removed vouchers when sheet closes to avoid accumulating unnecessary vouchers
  useEffect(() => {
    if (!sheetOpen) {
      setRemovedVouchers([]);
    }
  }, [sheetOpen]);

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
    // Check if voucher has voucherProducts and if cart items match
    const hasValidProducts = (() => {
      // If voucher doesn't have voucherProducts or it's empty, return false
      if (!voucher.voucherProducts || voucher.voucherProducts.length === 0) {
        return false
      }

      // If cart is empty, return false
      if (!orderDraft?.orderItems || orderDraft.orderItems.length === 0) {
        return false
      }

      // Check if at least one cart item matches voucher products
      const voucherProductSlugs = voucher.voucherProducts.map(vp => vp.product.slug)
      // const cartProductSlugs = orderDraft?.orderItems.map(item => item.productSlug)
      const cartProductSlugs = orderDraft.orderItems.reduce((acc, item) => {
        if (item.productSlug) acc.push(item.productSlug) // Slug của product
        return acc
      }, [] as string[])
      return isVoucherApplicableToCartItems(
        cartProductSlugs,
        voucherProductSlugs,
        voucher.applicabilityRule
      )
    })()

    // console.log('voucher:', voucher.title, hasValidProducts)
    // console.log('voucher:', voucher.title, isActive, isValidAmount, hasValidProducts)
    const sevenAmToday = moment().set({ hour: 7, minute: 0, second: 0, millisecond: 0 });
    const isValidDate = sevenAmToday.isSameOrBefore(moment(voucher.endDate));
    const requiresLogin = voucher.isVerificationIdentity === true
    const isUserLoggedIn = !!orderDraft?.owner && orderDraft.ownerRole === Role.CUSTOMER
    const isIdentityValid = !requiresLogin || (requiresLogin && isUserLoggedIn)
    return isValidAmount && isValidDate && isIdentityValid && hasValidProducts
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







  // const handleApplyVoucher = async () => {
  //   if (!selectedVoucher) return;

  //   if (appliedVoucher) {
  //     removeVoucher()
  //     setAppliedVoucher('')
  //     return
  //   }

  //   if (orderDraft?.ownerPhoneNumber) {
  //     const { data } = await refetchSpecificVoucher();
  //     const voucher = data?.result;

  //     if (voucher) {
  //       const validateVoucherParam: IValidateVoucherRequest = {
  //         voucher: voucher.slug,
  //         user: orderDraft?.owner || '',
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

  // const getVoucherErrorMessage = (voucher: IVoucher) => {
  //   if (voucher.isVerificationIdentity && !isCustomerOwner) {
  //     return t('voucher.needVerifyIdentity')
  //   }
  //   if (voucher.type !== VOUCHER_TYPE.SAME_PRICE_PRODUCT && voucher.minOrderValue > ((cartTotals?.subTotalBeforeDiscount || 0) - (cartTotals?.promotionDiscount || 0))) {
  //     return t('voucher.minOrderNotMet')
  //   }
  //   if (voucher.remainingUsage === 0) {
  //     return t('voucher.outOfStock')
  //   }
  //   if (moment(voucher.endDate).isBefore(moment().set({ hour: 7, minute: 0, second: 0, millisecond: 0 }))) {
  //     return t('voucher.expired')
  //   }
  //   if (voucher.minOrderValue > (cartTotals?.subTotalBeforeDiscount || 0)) {
  //     return t('voucher.minOrderNotMet')
  //   }
  //   return ''
  // }

  const getVoucherErrorMessage = (voucher: IVoucher) => {
    const cartProductSlugs = orderDraft?.orderItems?.map((item) => item.productSlug || '') || []
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
    const baseCardClass = `grid h-44 grid-cols-8 gap-2 p-2 rounded-md sm:h-48 relative
    ${isVoucherSelected(voucher.slug)
        ? `bg-${getTheme() === 'light' ? 'primary/10' : 'black'} border-primary`
        : `${getTheme() === 'light' ? 'bg-white' : 'border'}`
      }
    border border-muted-foreground/50
    ${voucher.remainingUsage === 0 && !isVoucherSelected(voucher.slug) ? 'opacity-50' : ''}
  `

    // const needsLogin = voucher.isVerificationIdentity && !orderDraft?.ownerPhoneNumber
    // const isVoucherUsable = isVoucherValid(voucher) && !needsLogin


    return (
      <div className={baseCardClass} key={voucher.slug}>
        {/* {isBest && (
          <div className="absolute -top-0 -left-0 px-2 py-1 text-xs text-white rounded-tl-md rounded-br-md bg-primary">
            {t('voucher.bestChoice')}
          </div>
        )} */}
        <div
          className={`col-span-2 flex w-full items-center justify-center rounded-md ${isVoucherSelected(voucher.slug) ? `bg-${getTheme() === 'light' ? 'white' : 'black'}` : 'bg-muted-foreground/10'}`}
        >
          <Ticket size={56} className="text-primary" />
        </div>
        <div className="flex flex-col col-span-4 justify-between w-full">
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
            <span className="flex gap-1 items-center text-sm text-muted-foreground">
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
            <div className="flex justify-between items-center">
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
        <div className="flex flex-col col-span-2 justify-between items-end">
          {!isMobile ? (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="p-2 h-8 text-muted-foreground"
                  >
                    <CircleHelp />
                  </Button>
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
                  className="p-2 h-8 text-muted-foreground"
                >
                  <CircleHelp />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className={`mr-2 w-[20rem] p-4 bg-${getTheme() === 'light' ? 'white' : 'black'} rounded-md text-muted-foreground shadow-md`}
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
            <div className="flex flex-col gap-1 items-end">
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
              {/* <div className="grid grid-cols-4 gap-2 items-center sm:grid-cols-5">
                <div className="relative col-span-3 p-1 sm:col-span-4">
                  <TicketPercent className="absolute left-2 top-1/2 text-gray-400 -translate-y-1/2" />
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
              <div className="grid grid-cols-1 gap-2 items-center">
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
