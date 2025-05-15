import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ShoppingCart } from 'lucide-react'

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
import { useCartItemStore, useUserStore } from '@/stores'
import { publicFileURL, ROUTE } from '@/constants'
import { formatCurrency } from '@/utils'
import { useNavigate } from 'react-router-dom'

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
  const [isOpen, setIsOpen] = useState(false)
  const [note, setNote] = useState<string>('')
  const [selectedVariant, setSelectedVariant] =
    useState<IProductVariant | null>(product.product.variants[0] || null)
  const { addCartItem } = useCartItemStore()
  const { getUserInfo } = useUserStore()

  const generateCartItemId = () => {
    return Date.now().toString(36)
  }

  const handleAddToCart = () => {
    if (!selectedVariant) return

    const finalPrice = product.promotion && product?.promotion?.value > 0
      ? selectedVariant.price * (1 - product?.promotion?.value / 100)
      : selectedVariant.price;

    const cartItem: ICartItem = {
      id: generateCartItemId(),
      slug: product.slug,
      owner: getUserInfo()?.slug,
      type: OrderTypeEnum.AT_TABLE, // default value, can be modified based on requirements
      // branch: getUserInfo()?.branch.slug, // get branch from user info
      orderItems: [
        {
          id: generateCartItemId(),
          slug: product.slug,
          image: product.product.image,
          name: product.product.name,
          quantity: 1,
          variant: selectedVariant.slug,
          size: selectedVariant.size.name,
          originalPrice: selectedVariant.price,
          price: finalPrice, // Use the calculated final price
          description: product.product.description,
          isLimit: product.product.isLimit,
          promotion: product.promotion ? product.promotion?.slug : '',
          // catalog: product.catalog,
          note: note,
        },
      ],
      table: '', // will be set later via addTable
    }

    addCartItem(cartItem)
    // Reset states
    setNote('')
    setSelectedVariant(product.product.variants[0] || null)
    setIsOpen(false)
  }

  const handleBuyNow = () => {
    if (!selectedVariant) return

    const finalPrice = product.promotion && product?.promotion?.value > 0
      ? selectedVariant.price * (1 - product?.promotion?.value / 100)
      : selectedVariant.price;

    const cartItem: ICartItem = {
      id: generateCartItemId(),
      slug: product.slug,
      owner: getUserInfo()?.slug,
      type: OrderTypeEnum.AT_TABLE, // default value, can be modified based on requirements
      // branch: getUserInfo()?.branch.slug, // get branch from user info
      orderItems: [
        {
          id: generateCartItemId(),
          slug: product.slug,
          image: product.product.image,
          name: product.product.name,
          quantity: 1,
          variant: selectedVariant.slug,
          size: selectedVariant.size.name,
          originalPrice: selectedVariant.price,
          price: finalPrice, // Use the calculated final price
          description: product.product.description,
          isLimit: product.product.isLimit,
          promotion: product.promotion ? product.promotion?.slug : '',
          // catalog: product.catalog,
          note: note,
        },
      ],
      table: '', // will be set later via addTable
    }

    addCartItem(cartItem)
    // Reset states
    setNote('')
    setSelectedVariant(product.product.variants[0] || null)
    setIsOpen(false)
    navigate(ROUTE.CLIENT_CART)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex [&_svg]:size-4 flex-row items-center justify-center gap-1 text-white text-xs rounded-full w-full shadow-none">
            <ShoppingCart className='icon' />
            {t('menu.addToCart')}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="h-[70%] max-w-[24rem] overflow-y-auto rounded-md p-4 sm:max-w-[60rem]">
        <DialogHeader>
          <DialogTitle>{t('menu.confirmProduct')}</DialogTitle>
          <DialogDescription>
            {t('menu.confirmProductDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          {/* Product Image */}
          <div className="relative col-span-2">
            {product.product.image ? (
              <img
                src={`${publicFileURL}/${product.product.image}`}
                alt={product.product.name}
                className="object-cover w-full h-56 rounded-md sm:h-64 lg:h-80"
              />
            ) : (
              <div className="w-full rounded-md bg-muted/50" />
            )}
          </div>

          <div className="flex flex-col col-span-2 gap-6">
            {/* Product Details */}
            <div>
              <h3 className="text-lg font-semibold">{product.product.name}</h3>
              <p className="text-sm text-muted-foreground">
                {product.product.description}
              </p>
            </div>

            {/* Size Selection */}
            {product.product.variants.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
                          {variant.size.name.toUpperCase()} -{' '}
                          {product.promotion && product?.promotion?.value > 0 ? formatCurrency((variant.price) * (1 - (product?.promotion?.value) / 100)) : formatCurrency(variant.price)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Price */}
            {/* <div className="text-lg font-bold text-primary">
              {t('menu.price')}
              {selectedVariant ? `${selectedVariant.price.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
            </div> */}

            {/* Note */}
            <div className="flex flex-col items-start space-y-2">
              <span className="text-sm">{t('menu.note')}</span>
              {/* <NotepadText size={28} className="text-muted-foreground" /> */}
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)} // Cập nhật state note khi người dùng nhập
                placeholder={t('menu.enterNote')}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-row gap-3 justify-end w-full">
          <Button onClick={handleBuyNow}>
            {t('menu.buyNow')}
          </Button>
          <Button variant='outline' className='border-primary text-primary hover:bg-primary/10 hover:text-primary' onClick={handleAddToCart} disabled={!selectedVariant}>
            {t('menu.addToCart')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
