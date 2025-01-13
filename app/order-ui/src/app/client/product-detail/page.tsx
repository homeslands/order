import { useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingCart } from 'lucide-react'

import { Button } from '@/components/ui'
import { useSpecificMenu, useSpecificMenuItem } from '@/hooks'
import { publicFileURL, ROUTE } from '@/constants'
import { ProductRating } from './components'
import { ProductDetailSkeleton } from '@/components/app/skeleton'
import { NonPropQuantitySelector } from '@/components/app/button'
import {
  useBranchStore,
  useCartItemStore,
  useCurrentUrlStore,
  useUserStore,
} from '@/stores'
import { ICartItem, IOrderType, IProductVariant } from '@/types'
import { formatCurrency, showErrorToast } from '@/utils'
import { ProductImageCarousel } from '.'
import moment from 'moment'

export default function ProductDetailPage() {
  const { t } = useTranslation(['product'])
  const { t: tMenu } = useTranslation(['menu'])
  const { slug } = useParams()
  const { getUserInfo } = useUserStore()
  const { setCurrentUrl } = useCurrentUrlStore()
  const navigate = useNavigate()
  const { branch } = useBranchStore()

  const { data: specificMenu } = useSpecificMenu({
    branch: branch?.slug,
    date: moment().format('YYYY-MM-DD'),
  })

  const { data: product, isLoading } = useSpecificMenuItem(slug as string)
  const { addCartItem } = useCartItemStore()

  const productDetail = product?.result.product
  const [size, setSize] = useState<string | null>(
    productDetail?.variants[0]?.size.name || null,
  )
  const [price, setPrice] = useState<number | null>(
    productDetail?.variants[0]?.price || null,
  )
  const [note, setNote] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [selectedVariant, setSelectedVariant] =
    useState<IProductVariant | null>(productDetail?.variants[0] || null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const generateCartItemId = () => {
    return Date.now().toString(36)
  }

  if (isLoading) {
    return <ProductDetailSkeleton />
  }

  const handleSizeChange = (variant: IProductVariant) => {
    setSelectedVariant(variant)
    setSize(variant.size.name)
    setPrice(variant.price)
  }

  const handleQuantityChange = (quantity: number) => {
    setQuantity(quantity)
  }

  const handleAddToCart = () => {
    const currentUrl = window.location.pathname
    if (!getUserInfo()?.slug)
      return (
        showErrorToast(1042), setCurrentUrl(currentUrl), navigate(ROUTE.LOGIN)
      )
    if (!selectedVariant) return
    const cartItem: ICartItem = {
      id: generateCartItemId(),
      slug: productDetail?.slug || '',
      owner: getUserInfo()?.slug,
      type: IOrderType.AT_TABLE, // default value
      orderItems: [
        {
          id: generateCartItemId(),
          slug: productDetail?.slug || '',
          image: productDetail?.image || '',
          name: productDetail?.name || '',
          quantity: quantity,
          variant: selectedVariant.slug,
          price: selectedVariant.price,
          description: productDetail?.description || '',
          isLimit: productDetail?.isLimit || false,
          note: note,
        },
      ],
      table: '', // will be set later via addTable
    }
    addCartItem(cartItem)
    // Reset states
    setNote('')
    setSelectedVariant(productDetail?.variants[0] || null)
  }

  return (
    <div>
      {/* Thumbnail */}
      <div className="container py-10">
        <div className={`transition-all duration-300 ease-in-out`}>
          <div className="flex flex-col items-start gap-10 lg:flex-row">
            {/* Product detail */}
            <div className="flex w-full flex-col gap-5 lg:w-3/4 lg:flex-row">
              <div className="col-span-1 flex w-full flex-col gap-2 lg:w-1/2">
                {productDetail && (
                  <img
                    src={`${publicFileURL}/${selectedImage || productDetail.image}`}
                    alt={productDetail.name}
                    className="h-[15rem] w-full rounded-xl object-cover transition-opacity duration-300 ease-in-out"
                  />
                )}
                <ProductImageCarousel
                  images={
                    productDetail
                      ? [productDetail.image, ...(productDetail.images || [])]
                      : []
                  }
                  onImageClick={setSelectedImage}
                />
              </div>
              <div className="col-span-1 flex flex-col gap-4">
                {productDetail && (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xl font-semibold">
                        {productDetail.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {productDetail.description}
                      </span>
                      {price ? (
                        <div className="text-lg font-semibold text-primary">
                          {`${formatCurrency(price)}`}
                        </div>
                      ) : (
                        <div className="font-semibold text-primary">
                          {t('product.chooseSizeToViewPrice')}
                        </div>
                      )}
                      {/* Product Rating */}
                      <div className="mt-2">
                        <ProductRating rating={productDetail.rating} />
                      </div>
                    </div>
                    {productDetail.variants.length > 0 && (
                      <div className="flex w-full flex-row items-center gap-6">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {t('product.selectSize')}
                        </label>
                        <div className="flex flex-row items-center justify-start gap-2">
                          {productDetail.variants.map((variant) => (
                            <div
                              // variant="outline"
                              className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-gray-500 p-2 text-xs transition-colors hover:border-primary hover:bg-primary hover:text-white ${size === variant.size.name ? 'border-primary bg-primary text-white' : 'bg-transparent'}`}
                              key={variant.slug}
                              onClick={() => handleSizeChange(variant)}
                            >
                              {variant.size.name.toUpperCase()}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {productDetail.variants.length > 0 && (
                      <div className="flex w-full flex-row items-center gap-6">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {t('product.selectQuantity')}
                        </label>
                        <div className="flex flex-row items-center justify-start gap-2">
                          <NonPropQuantitySelector
                            currentQuantity={product.result.currentStock}
                            onChange={handleQuantityChange}
                          />
                          <div className="text-xs text-muted-foreground">
                            {product.result.currentStock}/
                            {product.result.defaultStock} sản phẩm có sẵn
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <Button
                  onClick={handleAddToCart}
                  variant="default"
                  disabled={!size || quantity <= 0}
                >
                  <ShoppingCart />
                  {tMenu('menu.addToCart')}
                </Button>
              </div>
            </div>

            {/* Related products */}
            <div className="w-full lg:w-1/4">
              <p className="border-l-4 border-primary pl-2 text-primary">
                Món liên quan
              </p>
              <div className="mt-4 grid grid-cols-2 gap-5 lg:grid-cols-1">
                {specificMenu?.result.menuItems.map((item) => {
                  return (
                    <NavLink
                      key={item.slug}
                      to={`${ROUTE.CLIENT_MENU}/${item.slug}`}
                    >
                      <div
                        key={item.slug}
                        className="flex flex-col rounded-xl backdrop-blur-md transition-all duration-300 hover:scale-105"
                      >
                        {/* Image Section with Discount Tag */}
                        <div className="relative">
                          {item.product.image ? (
                            <img
                              src={`${publicFileURL}/${item.product.image}`}
                              alt={item.product.name}
                              className="h-36 w-full rounded-t-md object-cover"
                            />
                          ) : (
                            <div className="h-24 w-full rounded-t-md bg-muted/60" />
                          )}
                        </div>

                        <h3 className="mt-3 text-[13px]">
                          {item.product.name}
                        </h3>
                      </div>
                    </NavLink>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
