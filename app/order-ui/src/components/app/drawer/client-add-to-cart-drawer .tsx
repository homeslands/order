import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui';

import { OrderTypeEnum, IProductVariant, IProduct } from '@/types';
import { useCartItemStore, useUserStore } from '@/stores';
import { publicFileURL } from '@/constants';
import { formatCurrency } from '@/utils';
import { Plus } from 'lucide-react';

interface AddToCartDialogProps {
  product: IProduct;
}

export default function ClientAddToCartDrawer({ product }: AddToCartDialogProps) {
  const { t } = useTranslation(['menu']);
  const { t: tCommon } = useTranslation(['common']);
  const [note, setNote] = useState('');
  const [selectedVariant, setSelectedVariant] =
    useState<IProductVariant | null>(product.variants[0] || null);
  const { addCartItem } = useCartItemStore();
  const { getUserInfo } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);

  const generateCartItemId = () => {
    return Date.now().toString(36);
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    const cartItem = {
      id: generateCartItemId(),
      slug: product.slug,
      owner: getUserInfo()?.slug,
      type: OrderTypeEnum.AT_TABLE, // Default value
      orderItems: [
        {
          id: generateCartItemId(),
          slug: product.slug,
          image: product.image,
          name: product.name,
          quantity: 1,
          variant: selectedVariant.slug,
          price: selectedVariant.price,
          description: product.description,
          isLimit: product.isLimit,
          note,
        },
      ],
      table: '', // Will be set later if needed
    };

    addCartItem(cartItem);
    setNote('');
    setSelectedVariant(product.variants[0] || null);
    setIsOpen(false); // Close drawer after adding to cart
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button size="icon" className="text-white rounded-full shadow-none">
          <Plus />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[85%]">
        <DrawerHeader>
          <DrawerTitle>{t('menu.confirmProduct')}</DrawerTitle>
          <DrawerDescription>{t('menu.confirmProductDescription')}</DrawerDescription>
        </DrawerHeader>

        <div className="grid justify-center w-full max-w-sm grid-cols-1 gap-4 p-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
            {product.image ? (
              <img
                src={`${publicFileURL}/${product.image}`}
                alt={product.name}
                className="object-cover w-full h-48 rounded-md sm:h-64 lg:h-72"
              />
            ) : (
              <div className="w-full rounded-md bg-muted/50" />
            )}
          </div>

          <div className="flex flex-col gap-6 sm:col-span-2">
            <div>
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-sm text-muted-foreground">{product.description}</p>
            </div>

            {product.variants.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('menu.selectSize')}
                </label>
                <Select
                  value={selectedVariant?.slug}
                  onValueChange={(value) => {
                    const variant = product.variants.find(
                      (v) => v.slug === value
                    );
                    setSelectedVariant(variant || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('menu.selectSize')} />
                  </SelectTrigger>
                  <SelectContent>
                    {product.variants
                      .sort((a, b) => a.price - b.price)
                      .map((variant) => (
                        <SelectItem key={variant.slug} value={variant.slug}>
                          {variant.size.name.toUpperCase()} - {formatCurrency(variant.price)}
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
          </div>
        </div>

        <DrawerFooter className="grid grid-cols-2 gap-3">
          <DrawerClose asChild>
            <Button variant="outline">{tCommon('common.cancel')}</Button>
          </DrawerClose>
          <Button onClick={handleAddToCart} disabled={!selectedVariant}>
            {t('menu.addToCart')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}