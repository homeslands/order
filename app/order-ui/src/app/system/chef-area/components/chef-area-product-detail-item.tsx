import { useTranslation } from "react-i18next";

import { publicFileURL } from "@/constants";
import { IChefAreaProduct } from "@/types";
import { RemoveChefAreaProductDialog } from "@/components/app/dialog";
import { useIsMobile } from "@/hooks";

export default function ChefAreaProductDetailItem({ chefAreaProduct, onSuccess }: { chefAreaProduct: IChefAreaProduct, onSuccess: () => void }) {
    const { t } = useTranslation(['chefArea'])
    const isMobile = useIsMobile()

    return (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
            {chefAreaProduct.products.map((item) => (
                <div className="flex relative flex-col gap-2 justify-between items-center rounded-xl border group">
                    {!isMobile && (
                        <div className="flex absolute inset-0 justify-end items-start opacity-0 transition-opacity group-hover:opacity-100">
                            <div className="flex flex-row gap-2 p-4 bg-transparent rounded-md">
                                <RemoveChefAreaProductDialog onSuccess={onSuccess} chefAreaProduct={item} />
                            </div>
                        </div>
                    )}

                    {item?.image ? (
                        <div className="p-2 w-full">
                            <img
                                src={`${publicFileURL}/${item.image}`}
                                alt={item.name || ''}
                                className="object-cover w-full h-40 rounded-md"
                            />
                        </div>
                    ) : (
                        <div className="p-2 w-full h-40 rounded-md bg-muted/50" />
                    )}

                    <div className='flex flex-col gap-2 justify-start p-2 w-full'>
                        <h3 className="flex justify-start w-full text-lg font-bold">
                            {item?.name || ''}
                        </h3>
                        <p className="flex justify-start w-full text-sm text-muted-foreground">
                            {item?.description || t('chefArea.noDescription')}
                        </p>
                    </div>
                    {isMobile && (
                        <div className="flex justify-end px-4 py-2 w-full border-t bg-muted-foreground/10">
                            <RemoveChefAreaProductDialog onSuccess={onSuccess} chefAreaProduct={item} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}