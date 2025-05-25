import { useState } from 'react'
import { useTranslation } from 'react-i18next'
// import { ShoppingCart } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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

import { ICartItem, OrderTypeEnum, IProductVariant, IMenuItem } from '@/types'
import { useCartItemStore } from '@/stores'
import { publicFileURL } from '@/constants'
import { formatCurrency } from '@/utils'

interface AddToCartDialogProps {
  product: IMenuItem
  trigger?: React.ReactNode
}

export default function AddToCartDialog({
  product,
  trigger,
}: AddToCartDialogProps) {
  const { t } = useTranslation(['menu'])
  const { t: tCommon } = useTranslation(['common'])
  const [isOpen, setIsOpen] = useState(false)
  const [note, setNote] = useState<string>('')
  const [selectedVariant, setSelectedVariant] =
    useState<IProductVariant | null>(product.product.variants?.[0] || null)
  const { addCartItem } = useCartItemStore()

  const generateCartItemId = () => {
    return `cart_${Date.now().toString(36)}`
  }

  const generateOrderItemId = (cartId: string) => {
    return `${cartId}_order_${Date.now().toString(36)}`
  }

  const handleAddToCart = () => {
    if (!selectedVariant) return

    const finalPrice = product.promotion && product?.promotion?.value > 0
      ? selectedVariant.price * (1 - product?.promotion?.value / 100)
      : selectedVariant.price;

    const cartId = generateCartItemId();

    const cartItem: ICartItem = {
      id: cartId,
      slug: product.slug,
      owner: '',
      type: OrderTypeEnum.AT_TABLE,
      orderItems: [
        {
          id: generateOrderItemId(cartId),
          slug: product.slug,
          image: product.product.image,
          name: product.product.name,
          quantity: 1,
          size: selectedVariant.size.name,
          variant: selectedVariant.slug,
          originalPrice: selectedVariant.price,
          price: finalPrice,
          description: product.product.description,
          isLimit: product.product.isLimit,
          promotion: product.promotion ? product.promotion?.slug : '',
          promotionValue: product.promotion ? product.promotion?.value : 0,
          note,
        },
      ],
      table: '',
    }

    addCartItem(cartItem)
    // Reset states
    setNote('')
    setSelectedVariant(product.product.variants?.[0] || null)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex gap-1 justify-center items-center px-4 w-full text-white rounded-full shadow-none">
            {t('menu.addToCart')}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-[42rem] rounded-lg p-6 sm:max-w-[48rem]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {t('menu.confirmProduct')}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t('menu.confirmProductDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Product Image */}
          <div className="flex justify-center items-center">
            {product.product.image ? (
              <img
                src={`${publicFileURL}/${product.product.image}`}
                alt={product.product.name}
                className="object-cover w-full h-64 rounded-md border"
              />
            ) : (
              <div className="w-full h-64 rounded-md bg-muted/50" />
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col gap-4 justify-between">
            <div>
              <h3 className="text-lg font-semibold">{product.product.name}</h3>
              <p className="text-sm text-muted-foreground">
                {product.product.description}
              </p>
            </div>

            {/* Size Selection */}
            {product.product.variants.length > 0 && (
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  {t('menu.selectSize')}
                </label>
                <Select
                  value={selectedVariant?.slug}
                  onValueChange={(value) => {
                    const variant = product.product.variants.find(
                      (v) => v.slug === value,
                    )
                    setSelectedVariant(variant || null)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('menu.selectSize')} />
                  </SelectTrigger>
                  <SelectContent>
                    {product.product.variants
                      .sort((a, b) => a.price - b.price)
                      .map((variant) => (
                        <SelectItem key={variant.slug} value={variant.slug}>
                          {variant.size.name.toUpperCase()} –{' '}
                          {product.promotion?.value > 0
                            ? formatCurrency(
                              variant.price * (1 - product.promotion.value / 100),
                            )
                            : formatCurrency(variant.price)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Note Input */}
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('menu.note')}</label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('menu.enterNote')}
                className="resize-none"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <DialogFooter className="flex gap-2 justify-end pt-6">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {tCommon('common.cancel')}
          </Button>
          <Button onClick={handleAddToCart} disabled={!selectedVariant}>
            {t('menu.addToCart')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

  )
}
