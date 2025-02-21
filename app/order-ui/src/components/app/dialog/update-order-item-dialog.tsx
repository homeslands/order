import { useState } from 'react'
import { useParams } from 'react-router-dom'
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

import { IAddNewOrderItemRequest, IMenuItem, IProductVariant } from '@/types'
import { publicFileURL } from '@/constants'
import { formatCurrency, showToast } from '@/utils'
import { useAddNewOrderItem } from '@/hooks'

interface AddToCartDialogProps {
  onAddNewOrderItemSuccess: () => void
  product: IMenuItem
  trigger?: React.ReactNode
}

export default function UpdateOrderItemDialog({
  onAddNewOrderItemSuccess,
  product,
  trigger,
}: AddToCartDialogProps) {
  const { t } = useTranslation(['menu'])
  const { t: tCommon } = useTranslation(['common'])
  const { t: tToast } = useTranslation(['toast'])
  const { slug } = useParams()
  const [isOpen, setIsOpen] = useState(false)
  const [note, setNote] = useState<string>('')
  const [selectedVariant, setSelectedVariant] =
    useState<IProductVariant | null>(product.product.variants[0] || null)
  const { mutate: addNewOrderItem } = useAddNewOrderItem()

  const handleAddToCart = () => {
    if (!selectedVariant) return

    const newOrderItem: IAddNewOrderItemRequest = {
      order: slug as string,
      variant: selectedVariant.slug,
      promotion: product.promotion ? product?.promotion?.slug : '',
      quantity: 1,
      note: note,
    }

    addNewOrderItem(newOrderItem, {
      onSuccess: () => {
        setIsOpen(false)
        onAddNewOrderItemSuccess?.()
        showToast(tToast('toast.addNewOrderItemSuccess'))
        // Reset states
        setNote('')
        setIsOpen(false)
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex flex-row items-center justify-center w-full gap-1 px-4 text-white transition-all duration-300 rounded-full shadow-none cursor-pointer hover:scale-105">
            <ShoppingCart size={12} />
            {t('menu.addToCart')}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="h-[70%] max-w-[22rem] overflow-y-auto rounded-md p-4 sm:max-w-[60rem]">
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
                          {formatCurrency(variant.price)}
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

        <DialogFooter className="flex flex-row justify-end w-full gap-3">
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
