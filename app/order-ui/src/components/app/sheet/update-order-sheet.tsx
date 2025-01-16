import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CircleX, MapPinIcon, Search } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  Button,
  ScrollArea,
  Input,
  SheetTitle,
} from '@/components/ui'
import { useBranchStore, useCatalogStore, usePriceRangeStore } from '@/stores'
import { useDebouncedInput, useSpecificMenu } from '@/hooks'
import { FilterState } from '@/types'
import { formatCurrency } from '@/utils'
import moment from 'moment'
import { ClientCatalogSelect } from '../select'
import { PriceRangeFilter } from '@/app/client/menu/components/price-range-filter'
import { MenusInUpdateOrder } from '@/app/client/menu/components/menus-in-update-order'

export default function CheckoutCartSheet() {
  const { t } = useTranslation('menu')
  const { inputValue, setInputValue, debouncedInputValue } = useDebouncedInput()
  const { minPrice, maxPrice, clearPriceRange } = usePriceRangeStore()
  const { branch } = useBranchStore()
  const { catalog } = useCatalogStore()
  useEffect(() => {
    setFilters((prev: FilterState) => ({
      ...prev,
      branch: branch?.slug,
      catalog: catalog?.slug,
      productName: debouncedInputValue, // sử dụng giá trị debounce
      minPrice: minPrice,
      maxPrice: maxPrice,
    }))
  }, [minPrice, maxPrice, branch?.slug, catalog?.slug, debouncedInputValue])

  const handleSelectCatalog = (catalog: string) => {
    setFilters((prev: FilterState) => ({
      ...prev,
      catalog: catalog,
    }))
  }
  const [filters, setFilters] = useState<FilterState>({
    date: moment().format('YYYY-MM-DD'),
    branch: branch?.slug,
    catalog: catalog?.slug,
    productName: '',
    minPrice: minPrice,
    maxPrice: maxPrice,
  })
  const { data: specificMenu, isPending } = useSpecificMenu(filters)

  return (
    <Sheet>
      <SheetTrigger asChild className='fixed w-full top-20 right-10'>
        <Button className='w-fit'>
          {t('order.openMenu')}
        </Button>
        {/* <Button disabled={!orderItems?.table || orderItems?.table.slug === ''}>
          {t('order.confirmation')}
        </Button> */}
      </SheetTrigger>
      <SheetContent className="sm:max-w-4xl">
        <SheetHeader className="p-4">
          <SheetTitle className="text-primary">
            {t('order.orderInformation')}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full bg-transparent backdrop-blur-md">
          {/* Cart Items */}
          <ScrollArea className="max-h-[calc(100vh-8rem)] flex-1 px-4">
            <div className="flex flex-col items-start gap-5 lg:flex-row">
              {/* Left - sidebar */}
              <div className="sticky w-full lg:sticky lg:top-3 lg:z-10 lg:w-1/4">
                <div className="flex flex-col gap-4">
                  <div className="flex items-end gap-1 text-xs text-primary">
                    <MapPinIcon className="w-5 h-5" />
                    {branch ? `${branch.name} (${branch.address})` : t('menu.noData')}
                  </div>
                  {/* Product name search */}
                  <div className="relative w-full">
                    <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={t('menu.searchProduct')}
                      className="w-full pl-10 pr-10 bg-transparent"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                    {inputValue && (
                      <CircleX
                        className="absolute w-4 h-4 -translate-y-1/2 cursor-pointer right-3 top-1/2 text-muted-foreground hover:text-primary"
                        onClick={() => setInputValue('')}
                      />
                    )}
                  </div>
                  {/* Catalog filter */}
                  <ClientCatalogSelect onChange={handleSelectCatalog} />
                  {/* Price filter */}
                  <div className="flex items-center gap-2">
                    <div className="w-fit">
                      <PriceRangeFilter />
                    </div>
                    {minPrice !== 0 && maxPrice !== 0 && (
                      <div className="flex items-center gap-1 px-2 py-1 border rounded-full w-fit border-primary bg-primary/10 text-primary">
                        <span className="text-xs">{formatCurrency(minPrice)}</span>
                        <span className="text-xs">đến</span>
                        <span className="text-xs">{formatCurrency(maxPrice)}</span>
                        <CircleX
                          className="cursor-pointer"
                          onClick={() => clearPriceRange()}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full mt-4 lg:w-3/4">
                <MenusInUpdateOrder menu={specificMenu?.result} isLoading={isPending} />
              </div>
            </div>
            {/* <div className="flex flex-col flex-1 gap-4 pb-8">
              <div className="flex flex-col gap-4 py-2 space-y-2">
                Customer Information
                <div className="flex flex-col gap-4 pb-6 mt-6 border-b sm:relative">
                  <div className="flex flex-col gap-4">
                    <Label>{t('order.phoneNumber')}</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder={t('order.enterPhoneNumber')}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                      />
                      <Button
                        onClick={handleAddOwner(getUserInfo() as IUserInfo)}
                      >
                        {t('order.defaultApprover')}
                      </Button>
                    </div>
                    {orderItems && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          {orderItems.owner.firstName}{' '} {orderItems.owner.lastName}
                        </span>
                        <span className="text-sm">
                          {orderItems.owner.phonenumber}
                        </span>
                      </div>
                    )}
                  </div>

                  Dropdown danh sách user
                  {users.length > 0 && (
                    <div className="absolute z-10 w-full p-2 mt-16 bg-white border rounded-md shadow-lg">
                      {users.map((user, index) => (
                        <div
                          key={user.slug}
                          onClick={handleAddOwner(user)}
                          className={`cursor-pointer p-2 hover:bg-gray-100 ${index < users.length - 1 ? 'border-b' : ''
                            }`}
                        >
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.phonenumber}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                Table Information
                <div className="flex flex-col gap-4 pb-6 mt-5 border-b">
                  <div className="flex flex-col gap-2">
                    <Label>{t('order.deliveryMethod')}</Label>
                    <div className="flex flex-row items-center gap-4">
                      <div className="flex items-center justify-center px-4 py-1 text-xs font-thin rounded-full w-fit bg-primary/15 text-primary">
                        {t('order.dineIn')}
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          {t('order.tableNumber')}: {orderItems?.table.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                Cart Items
                {orderItems?.orderItems.map((item) => (
                  <div
                    key={item.slug}
                    className="flex flex-col gap-4 pb-4 border-b"
                  >
                    <div
                      key={`${item.slug}`}
                      className="flex items-center w-full gap-2 rounded-xl"
                    >
                      <img
                        src={`${publicFileURL}/${item.variant.product.image}`}
                        alt={item.variant.product.name}
                        className="object-cover w-20 h-20 rounded-2xl"
                      />
                      <div className="flex flex-col flex-1 gap-2">
                        <div className="flex flex-row items-start justify-between">
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="font-bold truncate">
                              {item.variant.product.name}
                            </span>
                            <span className="text-xs font-thin text-muted-foreground">
                              {`${formatCurrency(item.variant.price || 0)}`}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            onClick={() => handleRemoveCartItem(item.id)}
                          >
                            <Trash2
                              size={20}
                              className="text-muted-foreground"
                            />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between w-full text-sm font-medium">
                          <span>
                            {t('order.quantity')} {item.quantity}
                          </span>
                          <span className="font-semibold text-muted-foreground">
                            {`${formatCurrency((item.variant.price || 0) * item.quantity)}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <CartNoteInput cartItem={item} />
                  </div>
                ))}
              </div>
              <PromotionInput />
            </div> */}
          </ScrollArea>

          {/* Order Summary and Checkout */}
          {/* <div className="p-4 border-t">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('order.total')}
                </span>
                <span>{`${formatCurrency(subtotal || 0)}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('order.discount')}
                </span>
                <span className="text-xs text-green-600">
                  - {`${formatCurrency(discount)}`}
                </span>
              </div>
              <div className="flex flex-col justify-start">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">
                    {t('order.grandTotal')}
                  </span>
                  <span className="text-xl font-bold text-primary">
                    {`${formatCurrency(total)}`}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground/60">
                  {t('order.vat')}
                </div>
              </div>
            </div>
            <div className="grid items-center justify-between grid-cols-2 gap-2 py-4">
              <div className="col-span-1">
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => navigate(-1)}
                >
                  {tCommon('common.back')}
                </Button>
              </div>
              <CreateOrderDialog
              />{' '}
            </div>
          </div> */}
        </div>
      </SheetContent>
    </Sheet>
  )
}
