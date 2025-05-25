import { useState } from "react";
import moment from "moment";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Autoplay, Pagination, Grid } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { publicFileURL, ROUTE } from "@/constants";
import { SkeletonMenuList } from '@/components/app/skeleton';
import { Com } from '@/assets/images';
import { useSpecificMenu } from "@/hooks";
import { useBranchStore } from "@/stores";
import { FilterState, IProduct } from "@/types";
import { formatCurrency } from "@/utils";
import { PromotionTag } from "@/components/app/badge";

export default function SliderRelatedProducts({ currentProduct, catalog }: { currentProduct: string, catalog: string }) {
    const { t } = useTranslation('menu')
    const { branch } = useBranchStore()
    const [filters,] = useState<FilterState>({
        date: moment().format('YYYY-MM-DD'),
        branch: branch?.slug,
        catalog: catalog,
        productName: '',
    })

    const { data: relatedProducts, isPending } = useSpecificMenu(filters)
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
    // const { data: relatedProducts, isPending } = useSpecificMenu({ catalog, branch?.slug || "" })
    const relatedProductsData = relatedProducts?.result.menuItems.filter((item) => item.slug !== currentProduct)
    return (
        <Swiper
            slidesPerView={6}
            grid={{
                fill: 'row',
                rows: 1
            }}
            breakpoints={{
                320: { slidesPerView: 2, spaceBetween: 10, },
                560: { slidesPerView: 3, spaceBetween: 15, },
                768: { slidesPerView: 4, spaceBetween: 15, },
                1024: { slidesPerView: 5, spaceBetween: 15, },
                1280: { slidesPerView: 6, spaceBetween: 15, },
            }}
            initialSlide={0}
            modules={[Autoplay, Pagination, Grid]}
            className="w-full h-full mySwiper"
        >
            {!isPending ? relatedProductsData?.map((item, index) => {
                const imageProduct = item?.product.image ? publicFileURL + "/" + item.product.image : Com
                return (
                    <SwiperSlide key={index} className="py-2 mt-4 w-full h-full">
                        <NavLink to={`${ROUTE.CLIENT_MENU_ITEM}?slug=${item.slug}`}>
                            <div className="flex flex-col w-full min-h-[16rem] transition-all duration-300 bg-white rounded-xl shadow-xl dark:bg-gray-700 backdrop-blur-md hover:scale-105">
                                <img src={imageProduct} alt="product" className="object-cover w-full h-36 rounded-t-md" />

                                {item.promotion && item.promotion.value > 0 && (
                                    <PromotionTag promotion={item.promotion} />
                                )}
                                <div className={`flex flex-1 flex-col ${item.product.isLimit ? 'justify-between' : 'justify-start'} space-y-1.5 p-2`}>
                                    <div className="h-fit">
                                        <h3 className="font-bold text-md line-clamp-1">{item.product.name}</h3>
                                    </div>
                                    {item?.promotion && item?.promotion?.value > 0 ? (
                                        <div className="flex flex-col gap-1">
                                            <div className='flex gap-3 justify-start items-center'>
                                                <div className='flex flex-row gap-3 items-end'>
                                                    <span className="text-sm line-through text-muted-foreground/70">
                                                        {(() => {
                                                            const range = getPriceRange(item.product.variants)
                                                            if (!range) return formatCurrency(0)
                                                            return range.isSinglePrice
                                                                ? `${formatCurrency((range.min))}` : `${formatCurrency(range.min)}`
                                                        })()}
                                                    </span>
                                                </div>
                                                <span className="text-sm font-bold sm:text-lg text-primary">
                                                    {(() => {
                                                        const range = getPriceRange(item.product.variants)
                                                        if (!range) return formatCurrency(0)
                                                        return range.isSinglePrice
                                                            ? `${formatCurrency((range.min) * (1 - item?.promotion?.value / 100))}` : `${formatCurrency(range.min * (1 - item?.promotion?.value / 100))}`
                                                    })()}
                                                </span>

                                            </div>
                                            {item.product.isLimit && (
                                                <span className="px-3 py-1 text-xs text-white rounded-full bg-primary w-fit">
                                                    {t('menu.amount')} {item.currentStock}/{item.defaultStock}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-sm font-bold sm:text-lg text-primary">
                                            {(() => {
                                                const range = getPriceRange(item.product.variants)
                                                if (!range) return t('menu.contactForPrice')
                                                return range.isSinglePrice
                                                    ? `${formatCurrency(range.min)}`
                                                    : `${formatCurrency(range.min)}`
                                            })()}
                                        </span>
                                    )}

                                </div>
                            </div>
                        </NavLink>
                    </SwiperSlide>
                )
            }
            ) :
                [...Array(6)].map((_, index) => (
                    <SwiperSlide key={index} className="py-2 w-full h-full">
                        <SkeletonMenuList />
                    </SwiperSlide>
                ))
            }
        </Swiper >
    )
}