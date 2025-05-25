import { useEffect, useState } from 'react'
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { ShoppingCart } from 'lucide-react'

import { Badge, Button } from '@/components/ui'
import { useSpecificMenuItem } from '@/hooks'
import { publicFileURL, ROUTE } from '@/constants'
import { SliderRelatedProducts } from './components'
import { ProductDetailSkeleton } from '@/components/app/skeleton'
import { NonPropQuantitySelector } from '@/components/app/button'
import {
  useCartItemStore,
  useUserStore,
} from '@/stores'
import { ICartItem, OrderTypeEnum, IProductVariant } from '@/types'
import { formatCurrency, } from '@/utils'
import { ProductImageCarousel } from '.'

export default function ProductDetailPage() {
  const { t } = useTranslation(['product'])
  const { t: tMenu } = useTranslation(['menu'])
  const { t: tHelmet } = useTranslation('helmet')
  const [searchParams] = useSearchParams()
  const slug = searchParams.get('slug')
  const { getUserInfo } = useUserStore()

  const { data: product, isLoading } = useSpecificMenuItem(slug as string)
  const { addCartItem } = useCartItemStore()

  const productDetail = product?.result
  const [size, setSize] = useState<string | null>(null)
  const [price, setPrice] = useState<number | null>(null)
  const [note, setNote] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [selectedVariant, setSelectedVariant] = useState<IProductVariant | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (productDetail?.product.variants.length && productDetail?.product.variants.length > 0) {
      // Find the variant with lowest price
      const smallestVariant = productDetail.product.variants.reduce((prev, curr) =>
        prev.price < curr.price ? prev : curr
      )
      setSelectedVariant(smallestVariant)
      setSize(smallestVariant.size.name)
      setPrice(smallestVariant.price)
    }
  }, [productDetail])

  useEffect(() => {
    window.scrollTo(0, 0)
    if (productDetail?.product?.image) {
      setSelectedImage(productDetail?.product?.image)
    } else {
      setSelectedImage(null)
    }
  }, [productDetail])

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
    // const currentUrl = window.location.pathname
    // if (!getUserInfo()?.slug)
    //   return (
    //     showErrorToast(1042), setCurrentUrl(currentUrl), navigate(ROUTE.LOGIN)
    //   )
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
          size: selectedVariant.size.name,
          originalPrice: selectedVariant.price,
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

  const handleBuyNow = () => {
    if (!selectedVariant) return

    const finalPrice = productDetail?.promotion && productDetail?.promotion?.value > 0
      ? selectedVariant.price * (1 - productDetail?.promotion?.value / 100)
      : selectedVariant.price;

    const cartItem: ICartItem = {
      id: generateCartItemId(),
      slug: productDetail?.slug || '',
      owner: getUserInfo()?.slug,
      type: OrderTypeEnum.AT_TABLE, // default value, can be modified based on requirements
      // branch: getUserInfo()?.branch.slug, // get branch from user info
      orderItems: [
        {
          id: generateCartItemId(),
          slug: productDetail?.slug || '',
          image: productDetail?.product.image || '',
          name: productDetail?.product.name || '',
          quantity: 1,
          variant: selectedVariant.slug,
          size: selectedVariant.size.name,
          originalPrice: selectedVariant.price,
          price: finalPrice, // Use the calculated final price
          description: productDetail?.product.description || '',
          isLimit: productDetail?.product.isLimit || false,
          promotion: productDetail?.promotion ? productDetail?.promotion?.slug : '',
          // catalog: product.catalog,
          note: note,
        },
      ],
      table: '', // will be set later via addTable
    }

    addCartItem(cartItem)
    // Reset states
    setNote('')
    setSelectedVariant(productDetail?.product.variants[0] || null)
    navigate(ROUTE.CLIENT_CART)
  }
  return (
    <div className="container flex flex-col gap-10 items-start py-10">
      <Helmet>
        <meta charSet='utf-8' />
        <title>
          {tHelmet('helmet.productDetail.title')}
        </title>
        <meta name='description' content={tHelmet('helmet.productDetail.title')} />
      </Helmet>
      {/* Product detail */}
      <div className="flex flex-col gap-5 w-full lg:flex-row">
        <div className="flex flex-col col-span-1 gap-2 w-full lg:w-1/2">
          {productDetail && (
            <img
              src={`${publicFileURL}/${selectedImage}`}
              alt={productDetail.product.name}
              className="h-[15rem] sm:h-[20rem] w-full rounded-xl object-cover transition-opacity duration-300 ease-in-out"
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
        <div className="flex flex-col col-span-1 gap-4 justify-between w-full lg:w-1/2">
          {productDetail && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-extrabold">
                  {productDetail.product.name}
                </span>
                <span className="text-md text-muted-foreground">
                  {productDetail.product.description}
                </span>
                {price ? (
                  <div className="flex flex-col gap-2 justify-start items-start">
                    <div className='flex flex-row gap-2 items-center'>

                      {productDetail?.promotion && productDetail?.promotion?.value > 0 ? (
                        <div className='flex flex-col gap-1 items-start mt-3'>
                          <div className='flex flex-row gap-2 items-center'>
                            <span className='text-sm font-normal line-through text-muted-foreground'>
                              {`${formatCurrency(price)} `}
                            </span>
                            <Badge className="text-xs bg-destructive hover:bg-destructive">
                              {t('product.discount')} {productDetail?.promotion?.value}%
                            </Badge>
                          </div>
                          <span className="text-2xl font-extrabold text-primary">
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
                {/* <div className="mt-2">
                  <ProductRating rating={productDetail.product.rating} />
                </div> */}
              </div>
              {productDetail.product.variants.length > 0 && (
                <div className="flex flex-row gap-6 items-center w-full">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {t('product.selectSize')}
                  </label>
                  <div className="flex flex-row gap-2 justify-start items-center">
                    {productDetail.product.variants.map((variant) => (
                      <div
                        className={`flex w-fit px-5 py-[4px] cursor-pointer items-center justify-center rounded-full border border-gray-500  text-xs transition-colors hover:border-primary hover:bg-primary hover:text-white ${size === variant.size.name ? 'border-primary bg-primary text-white' : 'bg-transparent'}`}
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
                <div className="flex flex-row gap-6 items-center w-full">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {t('product.selectQuantity')}
                  </label>
                  <div className="flex flex-row gap-2 justify-start items-center">
                    <NonPropQuantitySelector
                      isLimit={productDetail.product.isLimit}
                      disabled={productDetail.isLocked}
                      currentQuantity={product?.result?.currentStock}
                      onChange={handleQuantityChange}
                    />
                    {productDetail?.product?.isLimit &&
                      <div className="text-xs text-muted-foreground">
                        {product.result.currentStock}/
                        {product.result.defaultStock}{' '}{t('product.inStock')}
                      </div>}
                  </div>
                </div>
              )}
              {/* Khuyến mãi */}
              {productDetail.promotion && (
                <div className="flex flex-col gap-4 p-4 bg-yellow-50 rounded-md border-l-4 border-yellow-500">
                  <div className="flex gap-2 items-center">
                    <span className="text-lg font-bold text-primary">
                      🎉 {t('product.specialOffer')}
                    </span>
                  </div>
                  <ul className="pl-5 text-sm list-disc text-primary">
                    <li>
                      {productDetail.promotion.description}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className='grid fixed right-0 left-0 bottom-16 z-50 grid-cols-2 gap-2 bg-white border-t md:relative md:mt-14 md:bg-transparent md:border-0'>
            <Button
              onClick={handleBuyNow}
              disabled={productDetail?.isLocked || !size || quantity <= 0 || productDetail?.currentStock === 0}
            >
              <ShoppingCart /> {productDetail?.isLocked || productDetail?.currentStock === 0 ? tMenu('menu.outOfStock') : tMenu('menu.buyNow')}
            </Button>
            <Button
              onClick={handleAddToCart}
              variant="outline"
              disabled={productDetail?.isLocked || !size || quantity <= 0 || productDetail?.currentStock === 0}
            >
              <ShoppingCart /> {productDetail?.isLocked || productDetail?.currentStock === 0 ? tMenu('menu.outOfStock') : tMenu('menu.addToCart')}
            </Button>
          </div>
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
      </div>
    </div>
  )
}
