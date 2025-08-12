import moment from 'moment'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui'

import { IProductVariant, IMenuItem, IOrderItem } from '@/types'
import { OrderFlowStep, useOrderFlowStore, useUserStore } from '@/stores'
import { publicFileURL, ROUTE } from '@/constants'
import { formatCurrency, showToast } from '@/utils'
import { NonPropQuantitySelector } from '../button'

interface AddToCartDialogProps {
  product: IMenuItem
  trigger?: React.ReactNode
}

export default function ClientAddToCartDialog({
  product,
  trigger,
}: AddToCartDialogProps) {
  const navigate = useNavigate()
  const { t } = useTranslation(['menu'])
  const { t: tToast } = useTranslation('toast')
  const [isOpen, setIsOpen] = useState(false)
  const [note, setNote] = useState<string>('')
  const [selectedVariant, setSelectedVariant] =
    useState<IProductVariant | null>(product.product.variants[0] || null)
  const [quantity, setQuantity] = useState<number>(1)
  const {
    currentStep,
    isHydrated,
    orderingData,
    initializeOrdering,
    addOrderingItem,
    setCurrentStep
  } = useOrderFlowStore()

  const handleQuantityChange = (quantity: number) => {
    setQuantity(quantity)
  }
  const { userInfo } = useUserStore()
  // 🚀 Đảm bảo đang ở ORDERING phase khi component mount
  useEffect(() => {
    if (isHydrated) {
      // Chuyển về ORDERING phase nếu đang ở phase khác
      if (currentStep !== OrderFlowStep.ORDERING) {
        setCurrentStep(OrderFlowStep.ORDERING)
      }

      // Khởi tạo ordering data nếu chưa có
      if (!orderingData) {
        initializeOrdering()
        return
      }

      // Chỉ re-initialize nếu user đã đăng nhập nhưng orderingData không có owner
      if (userInfo?.slug && !orderingData.owner?.trim()) {
        initializeOrdering()
      }
    }
  }, [isHydrated, currentStep, orderingData, userInfo?.slug, setCurrentStep, initializeOrdering])

  const handleAddToCart = () => {
    if (!selectedVariant) return
    if (!isHydrated) {
      return
    }

    // ✅ Step 2: Ensure ORDERING phase
    if (currentStep !== OrderFlowStep.ORDERING) {
      setCurrentStep(OrderFlowStep.ORDERING)
    }

    // Khởi tạo ordering data nếu chưa có
    if (!orderingData) {
      initializeOrdering()
      return
    }

    // Chỉ re-initialize nếu user đã đăng nhập nhưng orderingData không có owner
    if (userInfo?.slug && !orderingData.owner?.trim()) {
      initializeOrdering()
    }

    // ✅ Step 3: Create order item with proper structure
    const orderItem: IOrderItem = {
      id: `item_${moment().valueOf()}_${Math.random().toString(36).substr(2, 9)}`,
      slug: product?.product?.slug,
      image: product?.product?.image,
      name: product?.product?.name,
      quantity: quantity,
      size: product?.product?.variants[0]?.size?.name,
      allVariants: product?.product?.variants,
      variant: product?.product?.variants[0],
      originalPrice: product?.product?.variants[0]?.price,
      description: product?.product?.description,
      isLimit: product?.product?.isLimit,
      promotion: product?.promotion ? product?.promotion : null,
      promotionValue: product?.promotion ? product?.promotion?.value : 0,
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
    setSelectedVariant(product.product.variants[0] || null)
    setIsOpen(false)
  }

  const handleBuyNow = () => {
    if (!isHydrated) {
      return
    }

    if (!selectedVariant) {
      return
    }

    // ✅ Step 2: Ensure ORDERING phase
    if (currentStep !== OrderFlowStep.ORDERING) {
      setCurrentStep(OrderFlowStep.ORDERING)
    }

    // Khởi tạo ordering data nếu chưa có
    if (!orderingData) {
      initializeOrdering()
      return
    }

    // Chỉ re-initialize nếu user đã đăng nhập nhưng orderingData không có owner
    if (userInfo?.slug && !orderingData.owner?.trim()) {
      initializeOrdering()
    }

    // ✅ Step 3: Create order item with proper structure
    const orderItem: IOrderItem = {
      id: `item_${moment().valueOf()}_${Math.random().toString(36).substr(2, 9)}`,
      slug: product?.product?.slug,
      image: product?.product?.image,
      name: product?.product?.name,
      quantity: quantity,
      size: selectedVariant?.size?.name,
      allVariants: product?.product?.variants,
      variant: selectedVariant,
      originalPrice: selectedVariant?.price,
      description: product?.product?.description,
      isLimit: product?.product?.isLimit,
      promotion: product?.promotion ? product?.promotion : null,
      promotionValue: product?.promotion ? product?.promotion?.value : 0,
      note: note.trim(),
    }

    try {
      // ✅ Step 4: Add to ordering data
      addOrderingItem(orderItem)

      // ✅ Step 5: Success feedback
      showToast(tToast('toast.addSuccess'))

      // ✅ Step 6: Reset form state
      setNote('')
      setSelectedVariant(product?.product?.variants?.[0] || null)
      setIsOpen(false)

    } catch (error) {
      // ✅ Step 7: Error handling
      // eslint-disable-next-line no-console
      console.error('❌ Error adding item to cart:', error)
    }
    setNote('')
    setSelectedVariant(product.product.variants[0] || null)
    setIsOpen(false)
    navigate(ROUTE.CLIENT_CART)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex [&_svg]:size-4 flex-row items-center justify-center gap-1 text-white text-sm rounded-full w-full shadow-none">
            {t('menu.addToCart')}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-[800px] w-full p-6 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {t('menu.confirmProduct')}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t('menu.confirmProductDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Left: Image */}
          <div className="relative">
            <img
              src={`${publicFileURL}/${product.product.image}`}
              alt={product.product.name}
              className="w-full h-[320px] object-cover rounded-xl shadow-md"
            />
            {product.promotion && (
              <Badge className="absolute top-3 left-3 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-lg">
                -{product.promotion.value}%
              </Badge>
            )}
          </div>

          {/* Right: Info & Actions */}
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-xl font-semibold">{product.product.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {product.product.description}
              </p>
            </div>

            {product.product.variants.length > 0 && (
              <Select
                value={selectedVariant?.slug}
                onValueChange={(value) => {
                  const variant = product.product.variants.find(v => v.slug === value)
                  setSelectedVariant(variant || null)
                }}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder={t('menu.selectSize')} />
                </SelectTrigger>
                <SelectContent>
                  {product.product.variants
                    .sort((a, b) => a.price - b.price)
                    .map((variant) => {
                      const hasPromotion = !!product.promotion?.value
                      const discountedPrice = hasPromotion
                        ? Math.round(variant.price * (1 - product.promotion.value / 100))
                        : variant.price

                      return (
                        <SelectItem key={variant.slug} value={variant.slug}>
                          {variant.size.name.toUpperCase()} -{' '}
                          {hasPromotion ? (
                            <>
                              <span className="mr-2 text-gray-400 line-through">
                                {formatCurrency(variant.price)}
                              </span>
                              <span className="font-semibold text-primary">
                                {formatCurrency(discountedPrice)}
                              </span>
                            </>
                          ) : (
                            formatCurrency(variant.price)
                          )}
                        </SelectItem>
                      )
                    })}
                </SelectContent>
              </Select>
            )}

            <NonPropQuantitySelector
              isLimit={product.product.isLimit}
              disabled={product.isLocked}
              currentQuantity={product.currentStock}
              onChange={handleQuantityChange}
            />

            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('menu.enterNote')}
              className="text-sm rounded-lg"
            />

            <div className="flex gap-3 mt-auto">
              <Button
                onClick={handleBuyNow}
                className="flex-1"
              >
                {t('menu.buyNow')}
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-primary text-primary hover:bg-primary/10"
                onClick={handleAddToCart}
                disabled={!selectedVariant}
              >
                {t('menu.addToCart')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
