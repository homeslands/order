import moment from 'moment'
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
  OrderFlowStep,
  useOrderFlowStore,
} from '@/stores'
import { IProductVariant, IOrderItem } from '@/types'
import { formatCurrency, showToast, } from '@/utils'
import { ProductImageCarousel } from '.'

export default function ProductDetailPage() {
  const { t } = useTranslation(['product'])
  const { t: tMenu } = useTranslation(['menu'])
  const { t: tHelmet } = useTranslation('helmet')
  const { t: tToast } = useTranslation('toast')
  const [searchParams] = useSearchParams()
  const slug = searchParams.get('slug')

  const { data: product, isLoading } = useSpecificMenuItem(slug as string)
  const {
    currentStep,
    isHydrated,
    orderingData,
    initializeOrdering,
    addOrderingItem,
    setCurrentStep
  } = useOrderFlowStore()


  const [size, setSize] = useState<string | null>(null)
  const [price, setPrice] = useState<number | null>(null)
  const [note, setNote] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [selectedVariant, setSelectedVariant] = useState<IProductVariant | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const navigate = useNavigate()

  const productDetail = product?.result

  useEffect(() => {
    if (isHydrated && currentStep !== OrderFlowStep.ORDERING) {
      // Chuyển về ORDERING phase nếu đang ở phase khác
      setCurrentStep(OrderFlowStep.ORDERING)

      // Khởi tạo ordering data nếu chưa có
      if (!orderingData) {
        initializeOrdering()
      }
    }
  }, [isHydrated, currentStep, orderingData, setCurrentStep, initializeOrdering])

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
    if (!selectedVariant) return
    if (!isHydrated) {
      return
    }
    // ✅ Step 2: Ensure ORDERING phase
    if (currentStep !== OrderFlowStep.ORDERING) {
      setCurrentStep(OrderFlowStep.ORDERING)
    }

    if (!orderingData) {
      initializeOrdering()
    }

    // ✅ Step 3: Create order item with proper structure
    const orderItem: IOrderItem = {
      id: `item_${moment().valueOf()}_${Math.random().toString(36).substr(2, 9)}`,
      slug: productDetail?.product?.slug || '',
      image: productDetail?.product?.image || '',
      name: productDetail?.product?.name || '',
      quantity: quantity,
      size: selectedVariant.size.name,
      allVariants: productDetail?.product?.variants || [],
      variant: selectedVariant,
      originalPrice: selectedVariant.price,
      description: productDetail?.product?.description || '',
      isLimit: productDetail?.product?.isLimit || false,
      promotion: productDetail?.promotion ? productDetail?.promotion?.slug : null,
      promotionValue: productDetail?.promotion ? productDetail?.promotion?.value : 0,
      note: note.trim(),
    }

    try {
      // ✅ Step 4: Add to ordering data
      addOrderingItem(orderItem)

      // ✅ Step 5: Success feedback
      showToast(tToast('toast.addSuccess'))

    } catch (error) {
      // ✅ Step 7: Error handling
      // eslint-disable-next-line no-console
      console.error('❌ Error adding item to cart:', error)
    }
    // Reset states
    setNote('')
    setSelectedVariant(productDetail?.product.variants[0] || null)
  }

  const handleBuyNow = () => {
    if (!selectedVariant) return
    if (!isHydrated) return

    // Ensure ORDERING phase
    if (currentStep !== OrderFlowStep.ORDERING) {
      setCurrentStep(OrderFlowStep.ORDERING)
    }

    if (!orderingData) {
      initializeOrdering()
    }

    // Create order item
    const orderItem: IOrderItem = {
      id: `item_${moment().valueOf()}_${Math.random().toString(36).substr(2, 9)}`,
      slug: productDetail?.product?.slug || '',
      image: productDetail?.product?.image || '',
      name: productDetail?.product?.name || '',
      quantity: quantity,
      size: selectedVariant.size.name,
      allVariants: productDetail?.product?.variants || [],
      variant: selectedVariant,
      originalPrice: selectedVariant.price,
      description: productDetail?.product?.description || '',
      isLimit: productDetail?.product?.isLimit || false,
      promotion: productDetail?.promotion ? productDetail?.promotion?.slug : null,
      promotionValue: productDetail?.promotion ? productDetail?.promotion?.value : 0,
      note: note.trim(),
    }

    try {
      // Add to ordering data
      addOrderingItem(orderItem)

      // Success feedback
      showToast(tToast('toast.addSuccess'))

      // Reset states
      setNote('')
      setSelectedVariant(productDetail?.product.variants[0] || null)

      // Navigate to cart
      navigate(ROUTE.CLIENT_CART)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ Error adding item to cart:', error)
    }
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
        <div className="flex flex-col justify-between w-full col-span-1 gap-4 lg:w-1/2">
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
                  <div className="flex flex-col items-start justify-start gap-2">
                    <div className='flex flex-row items-center gap-2'>

                      {productDetail?.promotion && productDetail?.promotion?.value > 0 ? (
                        <div className='flex flex-col items-start gap-1 mt-3'>
                          <div className='flex flex-row items-center gap-2'>
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
              </div>
              {productDetail.product.variants.length > 0 && (
                <div className="flex flex-row items-center w-full gap-6">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {t('product.selectSize')}
                  </label>
                  <div className="flex flex-row items-center justify-start gap-2">
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
                <div className="flex flex-row items-center w-full gap-6">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {t('product.selectQuantity')}
                  </label>
                  <div className="flex flex-row items-center justify-start gap-2">
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
                </div>
              )}
            </div>
          )}

          <div className='fixed left-0 right-0 z-10 grid grid-cols-2 gap-2 bg-white border-t bottom-16 md:relative md:mt-14 md:bg-transparent md:border-0'>
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
