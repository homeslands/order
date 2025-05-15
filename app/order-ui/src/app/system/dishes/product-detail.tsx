import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'
import { useEffect, useState } from 'react'

import { ScrollArea, DataTable } from '@/components/ui'
import { useProductBySlug } from '@/hooks'
import { publicFileURL } from '@/constants'
import { ProductImageCarousel, ProductRating } from '.'
import { useProductVariantColumns } from './DataTable/columns'
import { ProductVariantActionOptions } from './DataTable/actions'
import { ProductDetailSkeleton } from '@/components/app/skeleton'
import { UploadMultipleProductImagesDialog } from '@/components/app/dialog'
import ProductImage from "@/assets/images/ProductImage.png"
export default function ProductManagementPage() {
  const { t } = useTranslation(['product'])
  const { slug } = useParams()
  const { data: product, isLoading } = useProductBySlug(slug as string)
  const productDetailColumns = useProductVariantColumns()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const productDetail = product?.result
  useEffect(() => {
    if (productDetail?.image) {
      setSelectedImage(productDetail.image)
    } else {
      setSelectedImage(null)
    }
  }, [productDetail?.image])
  if (isLoading) {
    return <ProductDetailSkeleton />
  }

  return (
    <div className="flex flex-row h-full gap-2">
      {/* Menu Section - Scrollable */}
      <ScrollArea className="flex-1">
        <div className={`pl-4 transition-all duration-300 ease-in-out`}>
          <div className="sticky top-0 z-10 flex flex-col items-center gap-2 pb-4 pr-4">
            <div className="flex flex-col flex-1 w-full mt-1">
              <div className="flex flex-row items-center justify-between">
                <span className="flex items-center gap-1 text-lg">
                  <SquareMenu />
                  {t('product.title')}
                </span>
              </div>
              <div className="flex flex-col gap-4">
                <div className="grid w-full grid-cols-2 gap-4 pb-8 mt-4 border-b">
                  <div className="flex flex-col h-full col-span-1 gap-2">
                    {productDetail && (
                      <img
                        src={selectedImage ? `${publicFileURL}/${selectedImage}` : ProductImage}
                        alt={productDetail.name}
                        className="object-cover w-full h-[20rem] transition-opacity duration-300 ease-in-out rounded-xl"
                      />
                    )}
                    <div className='flex items-center justify-center'>
                      <ProductImageCarousel
                        images={productDetail ? [productDetail.image, ...(productDetail.images || [])] : []}
                        onImageClick={setSelectedImage}
                      />
                    </div>
                  </div>
                  <div className="col-span-1">
                    {productDetail && (
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                          <div className='flex items-center justify-between'>
                            <span className="text-3xl font-semibold">
                              {productDetail.name}
                            </span>
                            <UploadMultipleProductImagesDialog product={productDetail} />
                          </div>
                          <div>
                            <span className="text-md text-muted-foreground">
                              {productDetail.description}
                            </span>
                          </div>
                          <div className="mt-2">
                            <ProductRating rating={productDetail.rating} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between w-full">
                  <span className="mt-2 text-xl font-semibold">
                    {t('product.variant')}
                  </span>
                </div>
                {/* Product Variants  */}
                <DataTable
                  columns={productDetailColumns}
                  data={productDetail?.variants || []}
                  isLoading={isLoading}
                  pages={1}
                  onPageChange={() => { }}
                  onPageSizeChange={() => { }}
                  actionOptions={ProductVariantActionOptions}
                />
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
