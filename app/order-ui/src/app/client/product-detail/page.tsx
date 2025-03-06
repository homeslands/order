import { useState } from 'react'
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { ShoppingCart } from 'lucide-react'

import { Badge, Button } from '@/components/ui'
import { useSpecificMenuItem } from '@/hooks'
import { publicFileURL, ROUTE } from '@/constants'
import { ProductRating, SliderRelatedProducts } from './components'
import { ProductDetailSkeleton } from '@/components/app/skeleton'
import { NonPropQuantitySelector } from '@/components/app/button'
import {
  useCartItemStore,
  useCurrentUrlStore,
  useUserStore,
} from '@/stores'
import { ICartItem, OrderTypeEnum, IProductVariant } from '@/types'
import { formatCurrency, showErrorToast } from '@/utils'
import { ProductImageCarousel } from '.'

export default function ProductDetailPage() {
  const { t } = useTranslation(['product'])
  const { t: tMenu } = useTranslation(['menu'])
  const { t: tHelmet } = useTranslation('helmet')
  const [searchParams] = useSearchParams()
  const slug = searchParams.get('slug')
  const { getUserInfo } = useUserStore()
  const { setCurrentUrl } = useCurrentUrlStore()
  const navigate = useNavigate()

  const { data: product, isLoading } = useSpecificMenuItem(slug as string)
  const { addCartItem } = useCartItemStore()

  const productDetail = product?.result
  const [size, setSize] = useState<string | null>(
    productDetail?.product.variants[0]?.size.name || null,
  )
  const [price, setPrice] = useState<number | null>(
    productDetail?.product.variants[0]?.price || null,
  )
  const [note, setNote] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [selectedVariant, setSelectedVariant] =
    useState<IProductVariant | null>(productDetail?.product.variants[0] || null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const generateCartItemId = () => {
    return Date.now().toString(36)
  }

  const finalPrice =
    productDetail?.promotion?.value && selectedVariant?.price
      ? selectedVariant.price * (1 - productDetail.promotion.value / 100)
      : selectedVariant?.price ?? 0;


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
      type: OrderTypeEnum.AT_TABLE, // default value
      orderItems: [
        {
          id: generateCartItemId(),
          slug: productDetail?.slug || '',
          image: productDetail?.product.image || '',
          name: productDetail?.product.name || '',
          quantity: quantity,
          variant: selectedVariant.slug,
          price: finalPrice,
          promotion: productDetail?.promotion ? productDetail?.promotion?.slug : '',
          description: productDetail?.product.description || '',
          isLimit: productDetail?.product.isLimit || false,
          note: note,
        },
      ],
      table: '', // will be set later via addTable
    }
    addCartItem(cartItem)
    // Reset states
    setNote('')
    setSelectedVariant(productDetail?.product.variants[0] || null)
  }

  return (
    <div className="container flex flex-col items-start gap-10 py-10">
      <Helmet>
        <meta charSet='utf-8' />
        <title>
          {tHelmet('helmet.productDetail.title')}
        </title>
        <meta name='description' content={tHelmet('helmet.productDetail.title')} />
      </Helmet>
      {/* Product detail */}
      <div className="flex flex-col w-full gap-5 lg:flex-row">
        <div className="flex flex-col w-full col-span-1 gap-2 lg:w-1/2">
          {productDetail && (
            <img
              src={`${publicFileURL}/${selectedImage || productDetail.product.image}`}
              alt={productDetail.product.name}
              className="h-[20rem] w-full rounded-xl object-cover transition-opacity duration-300 ease-in-out"
            />
          )}
          <ProductImageCarousel
            images={
              productDetail
                ? [productDetail.product.image, ...(productDetail.product.images || [])]
                : []
            }
            onImageClick={setSelectedImage}
          />
        </div>
        <div className="flex flex-col justify-between col-span-1 gap-4">
          {productDetail && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xl font-semibold">
                  {productDetail.product.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {productDetail.product.description}
                </span>
                {price ? (
                  <div className="flex flex-col items-start justify-start gap-2">
                    <div className='flex flex-row items-center gap-2'>

                      {productDetail?.promotion && productDetail?.promotion?.value > 0 ? (
                        <div className='flex flex-col items-start'>
                          <div className='flex flex-row items-center gap-2'>
                            <span className='text-sm font-normal line-through text-muted-foreground'>
                              {`${formatCurrency(price)} `}
                            </span>
                            <Badge className="text-xs bg-destructive hover:bg-destructive">
                              {t('product.discount')} {productDetail?.promotion?.value}%
                            </Badge>
                          </div>
                          <span className="text-xl font-semibold text-primary">
                            {formatCurrency(price - (price * productDetail?.promotion?.value) / 100)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xl font-semibold text-primary">
                          {formatCurrency(price)}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="font-semibold text-primary">
                    {t('product.chooseSizeToViewPrice')}
                  </div>
                )}
                {/* Product Rating */}
                <div className="mt-2">
                  <ProductRating rating={productDetail.product.rating} />
                </div>
              </div>
              {productDetail.product.variants.length > 0 && (
                <div className="flex flex-row items-center w-full gap-6">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {t('product.selectSize')}
                  </label>
                  <div className="flex flex-row items-center justify-start gap-2">
                    {productDetail.product.variants.map((variant) => (
                      <div
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
              {productDetail.product.variants.length > 0 && (
                <div className="flex flex-row items-center w-full gap-6">
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
                      {product.result.defaultStock}{' '}{t('product.inStock')}
                    </div>
                  </div>
                </div>
              )}
              {/* Khuyến mãi */}
              {productDetail.promotion && (
                <div className="flex flex-col gap-4 p-4 border-l-4 border-yellow-500 rounded-md bg-yellow-50">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">
                      🎉 {t('product.specialOffer')}
                    </span>
                  </div>
                  <ul className="pl-5 text-sm list-disc text-primary">
                    <li>
                      {productDetail.promotion.description}
                    </li>
                  </ul>
                  {/* <ul className="pl-5 text-sm list-disc text-primary">
                        <li>
                          <strong>Mua 2 tặng 1:</strong> Áp dụng cho tất cả các
                          kích cỡ.
                        </li>
                        <li>
                          <strong>Giảm 10%:</strong> Cho đơn hàng trên{' '}
                          <strong>500.000 VNĐ</strong>.
                        </li>
                        <li>
                          <strong>Freeship nội thành:</strong> Đơn từ{' '}
                          <strong>200.000 VNĐ</strong>.
                        </li>
                      </ul>
                      <div className="mt-2 text-xs text-yellow-600">
                        * Lưu ý: Các ưu đãi không được cộng gộp. Thời hạn đến
                        cuối tháng này!
                      </div> */}
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
      <div className="w-full">
        <p className="flex justify-between pl-2 border-l-4 border-primary text-primary">
          <span>
            {t('product.relatedProducts')}
          </span>
          <NavLink to={ROUTE.CLIENT_MENU}>
            <span className="text-sm text-muted-foreground">
              {t('product.goToMenu')}
            </span>
          </NavLink>
        </p>
        <SliderRelatedProducts currentProduct={slug || ''} catalog={productDetail?.product.catalog.slug || ''} />
        {/* <p className="flex justify-between pl-2 border-l-4 border-primary text-primary">
                <span>
                  {t('product.relatedProducts')}
                </span>
                <NavLink to={ROUTE.CLIENT_MENU}>
                  <span className="text-sm text-muted-foreground">
                    {t('product.viewMore')}
                  </span>
                </NavLink>
              </p>
              <div className="grid grid-cols-2 gap-5 mt-4 lg:grid-cols-4">
                {specificMenu?.result.menuItems.map((item) => {
                  return (
                    <NavLink
                      key={item.slug}
                      to={`${ROUTE.CLIENT_MENU_ITEM}?slug=${item.slug}`}
                    >
                      <div
                        key={item.slug}
                        className="flex flex-col transition-all duration-300 rounded-xl backdrop-blur-md hover:scale-105"
                      >
                        <div className="relative">
                          {item.product.image ? (
                            <img
                              src={`${publicFileURL}/${item.product.image}`}
                              alt={item.product.name}
                              className="object-cover w-full rounded-md h-36"
                            />
                          ) : (
                            <div className="w-full h-24 rounded-t-md bg-muted/60" />
                          )}
                        </div>

                        <h3 className="flex flex-col gap-1 mt-3">
                          <span className="font-semibold text-md">
                            {item.product.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {getPriceRange(item.product.variants, (value) =>
                              formatCurrency(value),
                            )}
                          </span>
                        </h3>
                      </div>
                    </NavLink>
                  )
                })}
              </div> */}
      </div>
    </div>
  )
}
