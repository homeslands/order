import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart } from 'lucide-react';

import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui';

import { IProductVariant, IMenuItem, IOrderItem } from '@/types';
import { useOrderFlowStore } from '@/stores';
import { publicFileURL } from '@/constants';
import { formatCurrency, showToast } from '@/utils';
import moment from 'moment';

interface AddToCartDialogProps {
  product: IMenuItem;
  onSuccess?: () => void;
}

export default function SystemAddToCurrentOrderDrawer({ product, onSuccess }: AddToCartDialogProps) {
  const { t } = useTranslation(['menu']);
  const { t: tCommon } = useTranslation(['common']);
  const { t: tToast } = useTranslation('toast')
  const [note, setNote] = useState('');
  const [selectedVariant, setSelectedVariant] =
    useState<IProductVariant | null>(product?.product?.variants?.[0] || null);
  const { addDraftItem } = useOrderFlowStore()
  const [isOpen, setIsOpen] = useState(false);

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
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button className="flex [&_svg]:size-4 flex-row items-center justify-center gap-1 text-white rounded-full w-full shadow-none">
          <ShoppingCart className='hidden icon sm:block' />
          {t('menu.addToCart')}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[90%]">
        <DrawerHeader>
          <DrawerTitle>{t('menu.confirmProduct')}</DrawerTitle>
          <DrawerDescription>{t('menu.confirmProductDescription')}</DrawerDescription>
        </DrawerHeader>

        <ScrollArea className="flex-1 max-h-[calc(100%-8rem)]">
          <div className="grid overflow-y-auto grid-cols-1 gap-4 justify-center p-4 w-full sm:grid-cols-4">
            <div className="sm:col-span-2">
              {product.product.image ? (
                <img
                  src={`${publicFileURL}/${product.product.image}`}
                  alt={product.product.name}
                  className="object-cover w-full h-48 rounded-md sm:h-64 lg:h-72"
                />
              ) : (
                <div className="w-full rounded-md bg-muted/50" />
              )}
            </div>

            <div className="flex flex-col gap-6 sm:col-span-2">
              <div>
                <h3 className="text-lg font-semibold line-clamp-1">{product.product.name}</h3>
                <p className="text-sm text-muted-foreground">{product.product.description}</p>
              </div>

              {product.product.variants.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t('menu.selectSize')}
                  </label>
                  <Select
                    value={selectedVariant?.slug}
                    onValueChange={(value) => {
                      const variant = product.product.variants.find(
                        (v) => v.slug === value
                      );
                      setSelectedVariant(variant || null);
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

              <div className="flex flex-col items-start space-y-2">
                <span className="text-sm">{t('menu.note')}</span>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t('menu.enterNote')}
                />
              </div>
              <div className='grid grid-cols-2 gap-2'>
                <DrawerClose asChild>
                  <Button variant="outline">{tCommon('common.cancel')}</Button>
                </DrawerClose>
                <Button onClick={handleAddToCurrentOrder} disabled={!selectedVariant}>
                  {t('menu.addToCart')}
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}