import React from "react";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { publicFileURL } from "@/constants/env";
import { IMenuItem, IProduct } from "@/types";
import { SkeletonMenuList } from '@/components/app/skeleton';
import { Com } from '@/assets/images';
import { formatCurrency } from "@/utils";
import { useTranslation } from "react-i18next";
import { Badge, Button } from "@/components/ui";
import { useIsMobile } from "@/hooks";
import { ClientAddToCartDrawer } from "@/components/app/drawer";
import { ClientAddToCartDialog } from "@/components/app/dialog";
import { NavLink } from "react-router-dom";
import { ROUTE } from "@/constants";

interface ISliderMenuPromotionProps {
    menus: IMenuItem[] | undefined
    isFetching: boolean
}

export default function SliderMenuPromotion({ menus, isFetching }: ISliderMenuPromotionProps): React.ReactElement {
    const { t } = useTranslation('menu')
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
    return (
        <Swiper
            breakpoints={{
                320: { slidesPerView: 1, spaceBetween: 10, },
                560: { slidesPerView: 2, spaceBetween: 30, },
                1024: { slidesPerView: 4, spaceBetween: 20, },
                1280: { slidesPerView: 5, spaceBetween: 15, },
            }}
            initialSlide={0}
            modules={[Autoplay, Pagination]}
            className="mySwiper w-full h-full"
        >
            {!isFetching ? menus?.map((item, index) => {
                const imageProduct = item?.product?.image ? publicFileURL + "/" + item.product.image : Com
                return (
                    <SwiperSlide key={index} className="w-full h-full py-2">
                        <div className="flex h-full w-full flex-col rounded-xl border shadow-sm bg-white dark:bg-gray-700 backdrop-blur-md transition-all duration-300 hover:scale-105">
                            <NavLink to={`${ROUTE.CLIENT_MENU_ITEM}?slug=${item.slug}`}>
                                <img src={imageProduct} alt="product" className="object-cover w-full h-36 rounded-t-md" />
                                <div className="flex flex-1 flex-col justify-between space-y-1.5 p-2">
                                    <div>
                                        <h3 className="text-lg font-bold line-clamp-1">{item.product.name}</h3>
                                        <p className="text-[12px] text-gray-500 dark:text-gray-300 break-words line-clamp-2 text-ellipsis overflow-hidden">
                                            {item?.product?.description || "Hương vị đặc biệt"}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between gap-1">
                                        <div className="flex flex-col">
                                            {item.product.variants.length > 0 ? (
                                                <div className="flex flex-col items-start justify-start gap-1">
                                                    <div className='flex flex-row items-center gap-1'>
                                                        {item.promotion && item?.promotion?.value > 0 ? (
                                                            <div className='flex flex-col items-start justify-start gap-1 mt-2'>
                                                                <span className="text-sm sm:text-lg text-primary">
                                                                    {(() => {
                                                                        const range = getPriceRange(item.product.variants)
                                                                        if (!range) return formatCurrency(0)
                                                                        return range.isSinglePrice
                                                                            ? `${formatCurrency((range.min) * (1 - item?.promotion?.value / 100))}` : `${formatCurrency(range.min * (1 - item?.promotion?.value / 100))}`
                                                                    })()}
                                                                </span>
                                                                <div className='flex flex-row items-center gap-3'>
                                                                    <span className="text-sm line-through text-muted-foreground/70">
                                                                        {(() => {
                                                                            const range = getPriceRange(item.product.variants)
                                                                            if (!range) return formatCurrency(0)
                                                                            return range.isSinglePrice
                                                                                ? `${formatCurrency((range.min))}` : `${formatCurrency(range.min)}`
                                                                        })()}
                                                                    </span>
                                                                    {item?.promotion?.value > 0 && (
                                                                        <Badge className="text-xs bg-destructive hover:bg-destructive">
                                                                            {t('menu.discount')} {item?.promotion?.value}%
                                                                        </Badge>
                                                                    )}
                                                                </div>

                                                            </div>) : (
                                                            <span className="text-sm font-bold sm:text-lg text-primary">
                                                                {(() => {
                                                                    const range = getPriceRange(item.product.variants)
                                                                    if (!range) return formatCurrency(0)
                                                                    return range.isSinglePrice
                                                                        ? `${formatCurrency(range.min)}`
                                                                        : `${formatCurrency(range.min)}`
                                                                })()}
                                                            </span>
                                                        )}

                                                    </div>
                                                    <span className="text-[0.7rem] text-muted-foreground">
                                                        {t('menu.amount')}
                                                        {item.currentStock}/{item.defaultStock}
                                                    </span>
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
                            {item.currentStock > 0 ? (
                                <div className="flex justify-center w-full gap-2 p-2">
                                    {isMobile ? (
                                        <ClientAddToCartDrawer product={item} />
                                    ) : (
                                        <ClientAddToCartDialog product={item} />
                                    )}
                                </div>
                            ) : (
                                <Button
                                    className="flex items-center justify-center w-full py-2 text-sm font-semibold text-white bg-red-500 rounded-full"
                                    disabled
                                >
                                    {t('menu.outOfStock')}
                                </Button>
                            )}
                        </div>
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