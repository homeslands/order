import moment from 'moment'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

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

import { IProductVariant, IMenuItem, IOrderItem } from '@/types'
import { publicFileURL } from '@/constants'
import { formatCurrency, showToast } from '@/utils'
import { useOrderFlowStore } from '@/stores'

interface AddToCurrentOrderDialogProps {
  onSuccess?: () => void
  product: IMenuItem
  trigger?: React.ReactNode
}

export default function SystemAddToCurrentOrderDialog({
  product,
  trigger,
  onSuccess,
}: AddToCurrentOrderDialogProps) {
  const { t } = useTranslation(['menu'])
  const { t: tCommon } = useTranslation(['common'])
  const { t: tToast } = useTranslation('toast')
  const [isOpen, setIsOpen] = useState(false)
  const [note, setNote] = useState<string>('')
  const [selectedVariant, setSelectedVariant] =
    useState<IProductVariant | null>(product.product.variants[0] || null)

  const { addDraftItem, updatingData } = useOrderFlowStore()

  const handleAddToCurrentOrder = () => {
    if (!selectedVariant) return

    const variant: IProductVariant = {
      ...selectedVariant,
      product: product.product,
    }

    const timestamp = moment().valueOf()

    // Tạo IOrderItem để thêm vào draft
    const orderItem: IOrderItem = {
      id: `item_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
      slug: product.slug,
      productSlug: product.product.slug,
      image: product.product.image,
      name: product.product.name,
      quantity: 1,
      size: selectedVariant.size.name,
      allVariants: product.product.variants,
      variant: variant,
      originalPrice: selectedVariant.price,
      promotion: product.promotion ? product.promotion : null,
      promotionValue: product.promotion ? product.promotion.value : 0,
      description: product.product.description,
      isLimit: product.product.isLimit,
      note,
    }

    // Thêm vào draft order
    addDraftItem(orderItem)

    // Reset states
    setNote('')
    setSelectedVariant(product.product.variants[0] || null)
    setIsOpen(false)
    showToast(tToast('toast.addSuccess'))
    onSuccess?.()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex [&_svg]:size-4 flex-row items-center justify-center gap-1 text-white rounded-full w-full shadow-none">
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
                          {product?.promotion?.value > 0 ? formatCurrency((variant.price) * (1 - (product?.promotion?.value) / 100)) : formatCurrency(variant.price)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Note */}
            <div className="flex flex-col items-start space-y-2">
              <span className="text-sm">{t('menu.note')}</span>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('menu.enterNote')}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-row gap-3 justify-end w-full">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {tCommon('common.cancel')}
          </Button>
          <Button onClick={handleAddToCurrentOrder} disabled={!selectedVariant || !updatingData}>
            {t('menu.addToCart')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
