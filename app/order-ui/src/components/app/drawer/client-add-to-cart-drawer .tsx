import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';

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

import { OrderTypeEnum, IProductVariant, IMenuItem, IAddNewOrderItemRequest } from '@/types';
import { useCartItemStore, useUserStore } from '@/stores';
import { publicFileURL } from '@/constants';
import { formatCurrency, showToast } from '@/utils';
import { useAddNewOrderItem } from '@/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

interface AddToCartDialogProps {
  product: IMenuItem;
  onSuccess?: () => void;
  isUpdateOrder?: boolean;

}

export default function ClientAddToCartDrawer({ product, onSuccess, isUpdateOrder }: AddToCartDialogProps) {
  const { t } = useTranslation(['menu']);
  const { t: tCommon } = useTranslation(['common']);
  const { t: tToast } = useTranslation('toast')
  const { slug } = useParams()
  const [note, setNote] = useState('');
  const [selectedVariant, setSelectedVariant] =
    useState<IProductVariant | null>(product?.product?.variants?.[0] || null);
  const { addCartItem } = useCartItemStore();
  const { getUserInfo } = useUserStore();
  const { mutate: addNewMenuItem } = useAddNewOrderItem()
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const generateCartItemId = () => {
    return Date.now().toString(36);
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    const finalPrice = product.promotion && product?.promotion?.value > 0
      ? selectedVariant.price * (1 - product?.promotion?.value / 100)
      : selectedVariant.price;

    const cartItem = {
      id: generateCartItemId(),
      slug: product.slug,
      owner: getUserInfo()?.slug || '',
      type: OrderTypeEnum.AT_TABLE, // Default value
      orderItems: [
        {
          id: generateCartItemId(),
          slug: product.slug,
          image: product.product.image,
          name: product.product.name,
          quantity: 1,
          allVariants: product.product.variants,
          variant: selectedVariant,
          size: selectedVariant.size.name,
          originalPrice: selectedVariant.price,
          price: finalPrice,
          description: product.product.description,
          isLimit: product.product.isLimit,
          promotion: product.promotion ? product.promotion?.slug : '',
          promotionValue: product.promotion ? product.promotion?.value : 0,
          note,
        },
      ],
      table: '', // Will be set later if needed
    };

    addCartItem(cartItem);
    setNote('');
    setSelectedVariant(product.product.variants?.[0] || null);
    setIsOpen(false); // Close drawer after adding to cart
  };

  const handleAddToCurrentOrder = () => {
    if (!selectedVariant) return

    const orderItem: IAddNewOrderItemRequest = {
      quantity: 1,
      variant: selectedVariant.slug,
      order: slug as string,
      promotion: product.promotion ? product.promotion?.slug : '',
      note: note,
    }
    addNewMenuItem(orderItem, {
      onSuccess: () => {
        setIsOpen(false)
        queryClient.invalidateQueries({ queryKey: ['specific-menu'] });
        onSuccess?.()
        showToast(tToast('toast.addNewOrderItemSuccess'))
      },
    })
    // Reset states
    setNote('')
    setSelectedVariant(product.product.variants[0] || null)
    setIsOpen(false)
  }

  useEffect(() => {
    const handleTouchStart = (e: Event) => {
      e.stopPropagation();
    };

    const drawerContent = document.querySelector('.drawer-content');
    if (drawerContent) {
      drawerContent.addEventListener('touchstart', handleTouchStart, { passive: false });
    }

    return () => {
      if (drawerContent) {
        drawerContent.removeEventListener('touchstart', handleTouchStart);
      }
    };
  }, [isOpen]);

  return (
    <Drawer modal={false} open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button className="flex z-50 [&_svg]:size-5 flex-row items-center justify-center gap-1 text-white rounded-full w-8 h-8 shadow-none">
          <Plus className='icon' />
          {/* {t('menu.addToCart')} */}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[95%] drawer-content">
        <DrawerHeader>
          <DrawerTitle>{t('menu.confirmProduct')}</DrawerTitle>
          <DrawerDescription>{t('menu.confirmProductDescription')}</DrawerDescription>
        </DrawerHeader>

        <ScrollArea className="flex-1 max-h-[calc(100%-8rem)]">
          <div className="grid justify-center w-full grid-cols-1 gap-4 p-4 overflow-y-auto sm:grid-cols-4">
            <div className="sm:col-span-2">
              {product.product.image ? (
                <img
                  src={`${publicFileURL}/${product.product.image}`}
                  alt={product.product.name}
                  className="object-cover w-full rounded-md pointer-events-auto select-none h-44 sm:h-64 lg:h-72 touch-manipulation"
                />
              ) : (
                <div className="w-full rounded-md bg-muted/50" />
              )}
            </div>

            <div className="flex flex-col gap-6 sm:col-span-2">
              <div>
                <h3 className="text-lg font-semibold">{product.product.name}</h3>
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
                <Button onClick={isUpdateOrder ? handleAddToCurrentOrder : handleAddToCart} disabled={!selectedVariant}>
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