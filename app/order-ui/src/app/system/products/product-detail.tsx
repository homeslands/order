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
    <div className="flex flex-row gap-2 h-full">
      {/* Menu Section - Scrollable */}
      <ScrollArea className="flex-1">
        <div className={`transition-all duration-300 ease-in-out`}>
          <div className="flex sticky top-0 z-10 flex-col gap-2 items-center pr-4 pb-4">
            <div className="flex flex-col flex-1 mt-1 w-full">
              <div className="flex flex-row justify-between items-center">
                <span className="flex gap-1 items-center text-lg">
                  <SquareMenu />
                  {t('product.title')}
                </span>
              </div>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4 pb-8 mt-4 w-full border-b">
                  <div className="flex flex-col col-span-1 gap-2 h-full">
                    {productDetail && (
                      <img
                        src={selectedImage ? `${publicFileURL}/${selectedImage}` : ProductImage}
                        alt={productDetail.name}
                        className="object-cover w-full h-[20rem] transition-opacity duration-300 ease-in-out rounded-xl border"
                      />
                    )}
                    <div className='flex justify-center items-center'>
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
                          <div className='flex justify-between items-center'>
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
                <div className="flex justify-between items-center w-full">
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
