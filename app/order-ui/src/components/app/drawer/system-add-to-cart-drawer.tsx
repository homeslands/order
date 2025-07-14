import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

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

import { OrderTypeEnum, IProductVariant, IMenuItem, IAddNewOrderItemRequest, IOrderItem } from '@/types';
import { useOrderFlowStore, useCartItemStore, useUserStore } from '@/stores';
import { publicFileURL } from '@/constants';
import { formatCurrency } from '@/utils';
import { useAddNewOrderItem } from '@/hooks';

interface AddToCartDialogProps {
  product: IMenuItem;
  onSuccess?: () => void;
  isUpdateOrder?: boolean;
}

export default function SystemAddToCartDrawer({ product, onSuccess, isUpdateOrder }: AddToCartDialogProps) {
  const { t } = useTranslation(['menu']);
  const { t: tCommon } = useTranslation(['common']);
  const { slug } = useParams()
  const [note, setNote] = useState('');
  const [selectedVariant, setSelectedVariant] =
    useState<IProductVariant | null>(product?.product?.variants?.[0] || null);

  // Cart store cho ordering mode
  const { addCartItem } = useCartItemStore();
  const { getUserInfo } = useUserStore();

  // Order Flow Store cho updating mode  
  const { addDraftItem, addOrderingItem, currentStep, updatingData } = useOrderFlowStore();

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
      owner: getUserInfo()?.slug,
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

  const handleAddToOrderFlow = () => {
    if (!selectedVariant) return;

    const timestamp = moment().valueOf();

    const orderItem: IOrderItem = {
      id: `item_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
      slug: product.product.slug,
      image: product.product.image,
      name: product.product.name,
      quantity: 1,
      size: selectedVariant.size.name,
      allVariants: product.product.variants,
      variant: selectedVariant,
      originalPrice: selectedVariant.price,
      promotion: product.promotion ? product.promotion.slug : null,
      promotionValue: product.promotion ? product.promotion.value : 0,
      description: product.product.description,
      isLimit: product.product.isLimit,
      note,
    };

    // Thêm vào updating draft nếu đang trong updating mode
    if (currentStep === 'updating' && updatingData) {
      addDraftItem(orderItem);
    }
    // Thêm vào ordering data nếu đang trong ordering mode
    else {
      addOrderingItem(orderItem);
    }

    // Reset states
    setNote('');
    setSelectedVariant(product.product.variants?.[0] || null);
    setIsOpen(false);
    onSuccess?.();
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
      },
    })
    // Reset states
    setNote('')
    setSelectedVariant(product.product.variants[0] || null)
    setIsOpen(false)
  }

  // Determine which handler to use based on context
  const getButtonHandler = () => {
    if (isUpdateOrder) {
      return handleAddToCurrentOrder; // API call for existing order
    }

    // Sử dụng Order Flow Store nếu đang trong flow
    if (currentStep === 'updating' || currentStep === 'ordering') {
      return handleAddToOrderFlow;
    }

    // Fallback to cart store 
    return handleAddToCart;
  };

  const isButtonDisabled = () => {
    if (!selectedVariant) return true;

    if (isUpdateOrder) {
      return false; // API call luôn available
    }

    if (currentStep === 'updating') {
      return !updatingData; // Cần có updating data
    }

    return false; // Ordering hoặc cart mode luôn available
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button className="flex [&_svg]:size-4 flex-row items-center justify-center gap-1 text-white rounded-full w-full shadow-none">
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
                <Button onClick={getButtonHandler()} disabled={isButtonDisabled()}>
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