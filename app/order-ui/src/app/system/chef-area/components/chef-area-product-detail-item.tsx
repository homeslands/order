import { useTranslation } from "react-i18next";

import { publicFileURL } from "@/constants";
import { IChefAreaProduct } from "@/types";
import { formatCurrency } from "@/utils";
import { RemoveChefAreaProductDialog } from "@/components/app/dialog";
import { useIsMobile } from "@/hooks";

export default function ChefAreaProductDetailItem({ product }: { product: IChefAreaProduct }) {
    const { t } = useTranslation(['chefArea'])
    const isMobile = useIsMobile()
    const getPriceRange = () => {
        if (!product.product.variants?.length) return null

        const prices = product.product.variants.map((variant) => variant.price)
        const minPrice = Math.min(...prices)
        const maxPrice = Math.max(...prices)

        return minPrice === maxPrice
            ? `${formatCurrency(minPrice)}`
            : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`
    }
    return (
        <div className="relative flex flex-col items-center justify-between gap-2 border group rounded-xl">
            {!isMobile && (
                <div className="absolute inset-0 flex items-start justify-end transition-opacity opacity-0 group-hover:opacity-100">
                    <div className="flex flex-row gap-2 p-4 bg-transparent rounded-md">
                        <RemoveChefAreaProductDialog product={product} />
                    </div>
                </div>
            )}

            {product.product.image ? (
                <div className="w-full p-2">
                    <img
                        src={`${publicFileURL}/${product.product.image}`}
                        alt={product.product.name}
                        className="object-cover w-full h-40 rounded-md"
                    />
                </div>
            ) : (
                <div className="w-full h-40 p-2 rounded-md bg-muted/50" />
            )}
            {/* <div className="absolute flex gap-2 top-4 left-4">
                {product.product.isTopSell && (
                    <Badge variant="secondary" className="text-white bg-yellow-500">
                        Top Seller
                    </Badge>
                )}
                {product.product.isNew && (
                    <Badge variant="secondary" className="text-white bg-green-500">
                        New
                    </Badge>
                )}
            </div> */}
            <div className='flex flex-col justify-start w-full gap-2 p-2'>
                <h3 className="flex justify-start w-full text-lg font-bold">
                    {product.product.name}
                </h3>
                <p className="flex justify-start w-full text-sm text-muted-foreground">
                    {product.product.description || t('chefArea.noDescription')}
                </p>
            </div>
            <div className="flex flex-col justify-between w-full gap-1 mt-2 text-sm font-medium">
                {product.product.variants && (
                    <span className="text-primary">{getPriceRange()}</span>
                )}
            </div>
            {isMobile && (
                <div className="flex justify-end w-full px-4 py-2 border-t bg-muted-foreground/10">
                    <RemoveChefAreaProductDialog product={product} />
                </div>
            )}
        </div>
    )
}