import React from "react";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { publicFileURL } from "@/constants/env";
import { IProduct } from "@/types";
import { SkeletonMenuList } from '@/components/app/skeleton';
import { Com } from '@/assets/images';

export default function SliderProduct({ products, isFetching }: { products: IProduct[], isFetching: boolean }): React.ReactElement {
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
            {!isFetching ? products?.map((item, index) => {
                const imageProduct = item?.image ? publicFileURL + "/" + item.image : Com
                return (
                    <SwiperSlide key={index} className="w-full h-full py-2">
                        <div className="flex h-full w-full flex-col rounded-xl border shadow-sm bg-white dark:bg-gray-700 backdrop-blur-md transition-all duration-300 hover:scale-105">
                            <img src={imageProduct} alt="product" className="object-cover w-full h-36 rounded-t-md" />
                            <div className="flex flex-1 flex-col justify-between space-y-1.5 p-2">
                                <div>
                                    <h3 className="text-lg font-bold line-clamp-1">{item.name}</h3>
                                    <p className="text-[12px] text-gray-500 dark:text-gray-300 break-words line-clamp-2 text-ellipsis overflow-hidden">
                                        {item?.description || "Hương vị đặc biệt"}
                                    </p>
                                </div>
                            </div>
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