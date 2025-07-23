import moment from "moment";
import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";

import { publicFileURL } from "@/constants/env";
import { Button } from "@/components/ui";
import { IMenuItem, IOrderItem, IProduct } from "@/types";
import { SkeletonMenuList } from '@/components/app/skeleton';
import { Com } from '@/assets/images';
import { formatCurrency, showToast } from "@/utils";
import { useIsMobile } from "@/hooks";
import { ClientAddToCartDialog } from "@/components/app/dialog";
import { ROUTE } from "@/constants";
import { PromotionTag } from "@/components/app/badge";
import { OrderFlowStep, useOrderFlowStore } from "@/stores";

interface ISliderMenuPromotionProps {
    menus: IMenuItem[] | undefined
    isFetching: boolean
    type?: string
}

export default function SliderMenu({ menus, isFetching, type }: ISliderMenuPromotionProps): React.ReactElement {
    const { t } = useTranslation('menu')
    const { t: tToast } = useTranslation('toast')
    // 🔥 Sử dụng Order Flow Store
    const {
        currentStep,
        isHydrated,
        orderingData,
        initializeOrdering,
        addOrderingItem,
        setCurrentStep
    } = useOrderFlowStore()
    const isMobile = useIsMobile()
    const getPriceRange = (variants: IProduct['variants']) => {
        if (!variants || variants.length === 0) return null

        const prices = variants.map((v) => v.price)
        const minPrice = Math.min(...prices)
        const maxPrice = Math.max(...prices)

        return {
            min: minPrice,
            max: maxPrice,
            isSinglePrice: minPrice === maxPrice,
        }
    }
    const breakpoints = {
        320: { slidesPerView: 2, spaceBetween: 10, },
        560: { slidesPerView: 2, spaceBetween: 30, },
        768: { slidesPerView: 3, spaceBetween: 30, },
        1024: { slidesPerView: 4, spaceBetween: 20, },
        1280: { slidesPerView: 5, spaceBetween: 15, },
    }

    let filteredMenus: IMenuItem[] = []

    if (type === "promotion") {
        filteredMenus = menus ? menus
            .filter((item) => item.promotion && item.promotion.value > 0)
            .sort((a, b) => b.promotion.value - a.promotion.value)
            .slice(0, 5) : []
    }

    else if (type === "new") {
        filteredMenus = menus ? menus
            .filter((item) => item.product.isNew)
            .slice(0, 5) : []
    }

    else if (type === "best-sell") {
        filteredMenus = menus ? menus
            .filter((item) => item.product.isTopSell)
            .slice(0, 5) : []
    }

    else {
        filteredMenus = menus ? menus.slice(0, 5) : []
    }

    // 🚀 Đảm bảo đang ở ORDERING phase khi component mount
    useEffect(() => {
        if (isHydrated && currentStep !== OrderFlowStep.ORDERING) {
            // Chuyển về ORDERING phase nếu đang ở phase khác
            setCurrentStep(OrderFlowStep.ORDERING)

            // Khởi tạo ordering data nếu chưa có
            if (!orderingData) {
                initializeOrdering()
            }
        }
    }, [isHydrated, currentStep, orderingData, setCurrentStep, initializeOrdering])

    const handleAddToCart = (product: IMenuItem) => {
        if (!product?.product?.variants || product?.product?.variants.length === 0 || !isHydrated) return;

        // ✅ Step 2: Ensure ORDERING phase
        if (currentStep !== OrderFlowStep.ORDERING) {
            setCurrentStep(OrderFlowStep.ORDERING)
        }

        if (!orderingData) {
            initializeOrdering()
        }

        // ✅ Step 3: Create order item with proper structure
        const orderItem: IOrderItem = {
            id: `item_${moment().valueOf()}_${Math.random().toString(36).substr(2, 9)}`,
            slug: product?.product?.slug,
            image: product?.product?.image,
            name: product?.product?.name,
            quantity: 1,
            size: product?.product?.variants[0]?.size?.name,
            allVariants: product?.product?.variants,
            variant: product?.product?.variants[0],
            originalPrice: product?.product?.variants[0]?.price,
            description: product?.product?.description,
            isLimit: product?.product?.isLimit,
            promotion: product?.promotion ? product?.promotion?.slug : null,
            promotionValue: product?.promotion ? product?.promotion?.value : 0,
            note: '',
        }

        try {
            // ✅ Step 4: Add to ordering data
            addOrderingItem(orderItem)

            // ✅ Step 5: Success feedback
            showToast(tToast('toast.addSuccess'))

        } catch (error) {
            // ✅ Step 7: Error handling
            // eslint-disable-next-line no-console
            console.error('❌ Error adding item to cart:', error)
        }
    };

    return (
        <Swiper
            breakpoints={breakpoints}
            initialSlide={0}
            modules={[Autoplay, Pagination]}
            className="w-full h-full overflow-y-visible mySwiper"
        >
            {!isFetching ? filteredMenus?.map((item, index) => {
                const imageProduct = item?.product?.image ? publicFileURL + "/" + item.product.image : Com
                return (
                    <SwiperSlide key={index} className="py-2 w-full h-[13.5rem] sm:h-[19rem]">
                        {!isMobile ? (
                            <div className="flex h-full w-full flex-col justify-between rounded-xl border shadow-xl bg-white dark:bg-transparent backdrop-blur-md transition-all duration-300 hover:scale-[1.03] ease-in-out">
                                <NavLink to={`${ROUTE.CLIENT_MENU_ITEM}?slug=${item.slug}`} className="relative items-center justify-center flex-shrink-0 w-24 h-full px-2 py-4 sm:p-0 sm:w-full sm:h-40">
                                    <>
                                        <img src={imageProduct} alt="product" className="object-cover p-1.5 w-full h-36 rounded-xl" />
                                        {item.promotion && item.promotion.value > 0 && (
                                            <PromotionTag promotion={item.promotion} />
                                        )}
                                    </>

                                    <div className="flex flex-1 flex-col justify-between space-y-1.5 p-2">
                                        <div>
                                            <h3 className="text-lg font-bold line-clamp-1">{item.product.name}</h3>
                                        </div>
                                        <div className="flex items-center justify-between h-full gap-1">
                                            <div className="flex flex-col">
                                                {item.product.variants.length > 0 ? (
                                                    <div className="flex flex-col items-start justify-start gap-1">
                                                        <div className='flex flex-row items-center gap-1'>
                                                            {item?.promotion?.value > 0 ? (
                                                                <div className="flex flex-row items-center gap-2">
                                                                    <span className="text-xs line-through sm:text-sm text-muted-foreground/70">
                                                                        {(() => {
                                                                            const range = getPriceRange(item.product.variants)
                                                                            if (!range) return formatCurrency(0)
                                                                            return formatCurrency(range.min)
                                                                        })()}
                                                                    </span>
                                                                    <span className="text-sm font-bold sm:text-lg text-primary">
                                                                        {(() => {
                                                                            const range = getPriceRange(item.product.variants)
                                                                            if (!range) return formatCurrency(0)
                                                                            return formatCurrency(range.min * (1 - item.promotion.value / 100))
                                                                        })()}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-sm font-bold sm:text-lg text-primary">
                                                                    {(() => {
                                                                        const range = getPriceRange(item.product.variants)
                                                                        if (!range) return formatCurrency(0)
                                                                        return formatCurrency(range.min)
                                                                    })()}
                                                                </span>
                                                            )}


                                                        </div>
                                                        {item?.product?.isLimit &&
                                                            <span className="text-[0.7rem] text-muted-foreground">
                                                                {t('menu.amount')}
                                                                {item.currentStock}/{item.defaultStock}
                                                            </span>}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm font-bold text-primary">
                                                        {t('menu.contactForPrice')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </NavLink>
                                {item.currentStock > 0 || !item?.product?.isLimit ? (
                                    <div className="flex items-end justify-end w-full gap-2 p-2">
                                        {isMobile ? (
                                            <div>
                                                {!item.isLocked && (item.currentStock > 0 || !item.product.isLimit) ? (
                                                    <Button onClick={() => handleAddToCart(item)} className="flex z-50 [&_svg]:size-5 flex-row items-center justify-center gap-1 text-white rounded-full w-8 h-8 shadow-none">
                                                        <Plus className='icon' />
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        className="py-1 text-xs font-semibold text-white bg-red-500 rounded-full w-28"
                                                        disabled
                                                    >
                                                        {t('menu.outOfStock')}
                                                    </Button>
                                                )}
                                            </div>
                                        ) : (
                                            <ClientAddToCartDialog product={item} />
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex justify-center w-full gap-2 p-2">
                                        <Button
                                            className="flex items-center justify-center w-full py-2 text-sm font-semibold text-white rounded-full bg-destructive"
                                            disabled
                                        >
                                            {t('menu.outOfStock')}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex h-full w-full flex-col justify-between rounded-xl border shadow-xl bg-white dark:bg-transparent backdrop-blur-md transition-all duration-300 hover:scale-[1.03] ease-in-out">

                                <NavLink to={`${ROUTE.CLIENT_MENU_ITEM}?slug=${item.slug}`}>
                                    <>
                                        <img src={imageProduct} alt="product" className="object-cover w-full p-1.5 h-28 rounded-xl" />
                                        {item.promotion && item.promotion.value > 0 && (
                                            <PromotionTag promotion={item.promotion} />
                                        )}
                                    </>
                                </NavLink>

                                <div className="flex flex-1 flex-col justify-between space-y-1.5 p-2">
                                    <div>
                                        <h3 className="text-sm font-bold line-clamp-1">{item.product.name}</h3>
                                    </div>
                                    <div className="flex items-center justify-between h-full gap-1">
                                        <div className="flex flex-col justify-end w-full h-full">
                                            {item.product.variants.length > 0 ? (
                                                <div className="flex flex-col items-center justify-end w-full h-full gap-1">
                                                    <div className='flex flex-row items-end w-full h-full gap-1'>
                                                        {item?.promotion?.value > 0 ? (
                                                            <div className="flex justify-between w-full">
                                                                <div className="flex flex-col items-start justify-start w-full">
                                                                    <span className="text-xs line-through text-muted-foreground/70">
                                                                        {(() => {
                                                                            const range = getPriceRange(item.product.variants)
                                                                            if (!range) return formatCurrency(0)
                                                                            return formatCurrency(range.min)
                                                                        })()}
                                                                    </span>
                                                                    <span className="text-sm font-bold text-primary">
                                                                        {(() => {
                                                                            const range = getPriceRange(item.product.variants)
                                                                            if (!range) return formatCurrency(0)
                                                                            return formatCurrency(range.min * (1 - item.promotion.value / 100))
                                                                        })()}
                                                                    </span>
                                                                </div>
                                                                {item.currentStock > 0 || !item?.product?.isLimit ? (
                                                                    <div className="flex items-end justify-end w-full gap-2">
                                                                        {isMobile ? (
                                                                            <div>
                                                                                {!item.isLocked && (item.currentStock > 0 || !item.product.isLimit) ? (
                                                                                    <Button onClick={() => handleAddToCart(item)} className="flex z-50 [&_svg]:size-5 flex-row items-center justify-center gap-1 text-white rounded-full w-8 h-8 shadow-none">
                                                                                        <Plus className='icon' />
                                                                                    </Button>
                                                                                ) : (
                                                                                    <Button
                                                                                        className="py-1 text-xs font-semibold text-white bg-red-500 rounded-full w-28"
                                                                                        disabled
                                                                                    >
                                                                                        {t('menu.outOfStock')}
                                                                                    </Button>
                                                                                )}
                                                                            </div>
                                                                        ) : (
                                                                            <ClientAddToCartDialog product={item} />
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex justify-center w-full gap-2 p-2">
                                                                        <Button
                                                                            className="flex items-center justify-center w-full py-2 text-sm font-semibold text-white rounded-full bg-destructive"
                                                                            disabled
                                                                        >
                                                                            {t('menu.outOfStock')}
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-between w-full">
                                                                <span className="w-full text-sm font-bold text-primary">
                                                                    {(() => {
                                                                        const range = getPriceRange(item.product.variants)
                                                                        if (!range) return formatCurrency(0)
                                                                        return formatCurrency(range.min)
                                                                    })()}
                                                                </span>
                                                                {item.currentStock > 0 || !item?.product?.isLimit ? (
                                                                    <div className="flex items-end justify-end w-full gap-2">
                                                                        {isMobile ? (
                                                                            <div>
                                                                                {!item.isLocked && (item.currentStock > 0 || !item.product.isLimit) ? (
                                                                                    <Button onClick={() => handleAddToCart(item)} className="flex z-50 [&_svg]:size-5 flex-row items-center justify-center gap-1 text-white rounded-full w-8 h-8 shadow-none">
                                                                                        <Plus className='icon' />
                                                                                    </Button>
                                                                                ) : (
                                                                                    <Button
                                                                                        className="py-1 text-xs font-semibold text-white bg-red-500 rounded-full w-28"
                                                                                        disabled
                                                                                    >
                                                                                        {t('menu.outOfStock')}
                                                                                    </Button>
                                                                                )}
                                                                            </div>
                                                                        ) : (
                                                                            <ClientAddToCartDialog product={item} />
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex justify-center w-full gap-2 p-2">
                                                                        <Button
                                                                            className="flex items-center justify-center w-full py-2 text-sm font-semibold text-white rounded-full bg-destructive"
                                                                            disabled
                                                                        >
                                                                            {t('menu.outOfStock')}
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-sm font-bold text-primary">
                                                    {t('menu.contactForPrice')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </SwiperSlide>
                )
            }
            ) :
                [...Array(6)].map((_, index) => (
                    <SwiperSlide key={index} className="w-full h-full py-2">
                        <SkeletonMenuList />
                    </SwiperSlide>
                ))
            }
        </Swiper >
    )
}