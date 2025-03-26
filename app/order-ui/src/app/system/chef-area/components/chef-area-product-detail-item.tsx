import { useTranslation } from "react-i18next";

import { publicFileURL } from "@/constants";
import { IChefAreaProduct, IProduct } from "@/types";
import { RemoveChefAreaProductDialog } from "@/components/app/dialog";
import { useIsMobile } from "@/hooks";

export default function ChefAreaProductDetailItem({ chefAreaProduct }: { chefAreaProduct: IChefAreaProduct }) {
    const { t } = useTranslation(['chefArea'])
    const isMobile = useIsMobile()

    return (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
            {chefAreaProduct.products.map((product: IProduct) => (
                <div className="relative flex flex-col items-center justify-between gap-2 border group rounded-xl">
                    {!isMobile && (
                        <div className="absolute inset-0 flex items-start justify-end transition-opacity opacity-0 group-hover:opacity-100">
                            <div className="flex flex-row gap-2 p-4 bg-transparent rounded-md">
                                <RemoveChefAreaProductDialog chefAreaProduct={product} />
                            </div>
                        </div>
                    )}

                    {product?.image ? (
                        <div className="w-full p-2">
                            <img
                                src={`${publicFileURL}/${product.image}`}
                                alt={product.name || ''}
                                className="object-cover w-full h-40 rounded-md"
                            />
                        </div>
                    ) : (
                        <div className="w-full h-40 p-2 rounded-md bg-muted/50" />
                    )}

                    <div className='flex flex-col justify-start w-full gap-2 p-2'>
                        <h3 className="flex justify-start w-full text-lg font-bold">
                            {product?.name || ''}
                        </h3>
                        <p className="flex justify-start w-full text-sm text-muted-foreground">
                            {product?.description || t('chefArea.noDescription')}
                        </p>
                    </div>
                    {isMobile && (
                        <div className="flex justify-end w-full px-4 py-2 border-t bg-muted-foreground/10">
                            <RemoveChefAreaProductDialog chefAreaProduct={product} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}