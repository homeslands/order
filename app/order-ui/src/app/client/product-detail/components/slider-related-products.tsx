import { useState } from "react";
import moment from "moment";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { publicFileURL, ROUTE } from "@/constants";
import { SkeletonMenuList } from '@/components/app/skeleton';
import { Com } from '@/assets/images';
import { useSpecificMenu } from "@/hooks";
import { useBranchStore } from "@/stores";
import { FilterState, IProduct } from "@/types";
import { Badge } from "@/components/ui";
import { formatCurrency } from "@/utils";

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
            breakpoints={{
                320: { slidesPerView: 1, spaceBetween: 10, },
                560: { slidesPerView: 2, spaceBetween: 30, },
                1024: { slidesPerView: 4, spaceBetween: 20, },
                1280: { slidesPerView: 5, spaceBetween: 15, },
            }}
            initialSlide={0}
            modules={[Autoplay, Pagination]}
            className="w-full h-full mySwiper"
        >
            {!isPending ? relatedProductsData?.map((item, index) => {
                const imageProduct = item?.product.image ? publicFileURL + "/" + item.product.image : Com
                return (
                    <SwiperSlide key={index} className="w-full h-full py-2">
                        <NavLink to={`${ROUTE.CLIENT_MENU_ITEM}?slug=${item.slug}`}>
                            <div className="flex flex-col w-full min-h-[18rem] transition-all duration-300 bg-white border rounded-xl dark:bg-gray-700 backdrop-blur-md hover:scale-105">
                                <img src={imageProduct} alt="product" className="object-cover w-full h-36 rounded-t-md" />
                                <div className="flex flex-1 flex-col justify-between space-y-1.5 p-2">
                                    <div>
                                        <h3 className="text-lg font-bold line-clamp-1">{item.product.name}</h3>
                                        <p className="text-[12px] text-gray-500 dark:text-gray-300 break-words line-clamp-2 text-ellipsis overflow-hidden">
                                            {item?.product.description || "Hương vị đặc biệt"}
                                        </p>
                                    </div>
                                    {item?.promotion && item?.promotion?.value > 0 ? (
                                        <div className='flex flex-col items-start justify-start gap-1 mt-2'>
                                            <span className="text-sm font-bold sm:text-lg text-primary">
                                                {(() => {
                                                    const range = getPriceRange(item.product.variants)
                                                    if (!range) return formatCurrency(0)
                                                    return range.isSinglePrice
                                                        ? `${formatCurrency((range.min) * (1 - item?.promotion?.value / 100))}` : `${formatCurrency(range.min * (1 - item?.promotion?.value / 100))}`
                                                })()}
                                            </span>
                                            <div className='flex flex-row items-end gap-3'>
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
                    <SwiperSlide key={index} className="w-full h-full py-2">
                        <SkeletonMenuList />
                    </SwiperSlide>
                ))
            }
        </Swiper >
    )
}