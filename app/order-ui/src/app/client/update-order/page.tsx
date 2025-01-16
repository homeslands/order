import _ from 'lodash'
import { NavLink } from 'react-router-dom'
import {
    CircleAlert,
    ShoppingBag,
    ShoppingCartIcon,
    Trash2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { UpdateOrderQuantitySelector } from '@/components/app/button'
import { ClientUpdateOrderTableSelect } from '@/app/system/menu'
import { UpdateOrderNoteInput } from '@/components/app/input'
import {
    ConfirmUpdateOrderDialog,
    RemoveOrderItemInUpdateOrderDialog,
} from '@/components/app/dialog'
import { publicFileURL, ROUTE } from '@/constants'
import { OrderTypeEnum } from '@/types'
import { Button } from '@/components/ui'
import { UpdateOrderSheet } from '@/components/app/sheet'
import { useUpdateOrderStore } from '@/stores'

export default function ClientUpdateOrderPage() {
    const { t } = useTranslation('menu')
    const { orderItems, addOrderType } = useUpdateOrderStore()
    const handleAddDeliveryMethod = (orderType: OrderTypeEnum) => {
        addOrderType(orderType)
    }
    // if (isLoading) {
    //     return <UpdateOrderSkeleton />
    // }

    if (_.isEmpty(orderItems?.orderItems)) {
        return (
            <div className="container py-20 lg:h-[60vh]">
                <div className="flex flex-col items-center justify-center gap-5">
                    <ShoppingCartIcon className="w-32 h-32 text-primary" />
                    <p className="text-center text-[13px]">Giỏ hàng trống</p>
                    <NavLink to={ROUTE.CLIENT_MENU}>
                        <Button variant="default">Quay lại trang thực đơn</Button>
                    </NavLink>
                </div>
            </div>
        )
    }

    return (
        <div className={`container py-10`}>
            {orderItems?.orderItems ? (
                <div className="flex flex-col gap-4 p-5 bg-white rounded-sm shadow-lg">
                    {/* Order type selection */}
                    <div className="grid w-full grid-cols-2 gap-2 sm:max-w-xs">
                        <div
                            onClick={() => handleAddDeliveryMethod(OrderTypeEnum.AT_TABLE)}
                            className={`flex cursor-pointer items-center justify-center py-2 text-sm transition-colors duration-200 ${orderItems.type === OrderTypeEnum.AT_TABLE
                                ? 'border-primary border bg-primary text-white'
                                : 'border'
                                } rounded-full border-muted-foreground/40 text-muted-foreground hover:border-primary hover:bg-primary hover:text-white`}
                        >
                            {t('menu.dineIn')}
                        </div>
                        <div
                            onClick={() => handleAddDeliveryMethod(OrderTypeEnum.TAKE_OUT)}
                            className={`flex cursor-pointer items-center justify-center py-1 text-sm transition-colors duration-200 ${orderItems.type === OrderTypeEnum.TAKE_OUT
                                ? 'border-primary border bg-primary text-white'
                                : 'border'
                                } rounded-full border-muted-foreground/40 text-muted-foreground hover:border-primary hover:bg-primary hover:text-white`}
                        >
                            {t('menu.takeAway')}
                        </div>
                    </div>
                    {/* Table list order items */}
                    <div className="my-4">
                        <div className="grid grid-cols-7 px-4 py-3 mb-4 text-sm font-thin rounded-md bg-muted/60">
                            <span className="col-span-2">{t('order.product')}</span>
                            <span className="col-span-2 text-center">
                                {t('order.quantity')}
                            </span>
                            <span className="col-span-2 text-center">
                                {t('order.grandTotal')}
                            </span>
                            <span className="flex justify-center col-span-1">
                                <Trash2 size={18} />
                            </span>
                        </div>

                        <div className="flex flex-col border rounded-md">
                            {orderItems?.orderItems.map((item) => (
                                <div
                                    key={item.slug}
                                    className="grid items-center w-full gap-4 p-4 pb-4 rounded-md"
                                >
                                    <div
                                        key={`${item.slug}`}
                                        className="grid flex-row items-center w-full grid-cols-7"
                                    >
                                        <div className="flex w-full col-span-2 gap-2">
                                            <div className="flex flex-col items-center justify-start gap-2 sm:flex-row sm:justify-center">
                                                <img
                                                    src={`${publicFileURL}/${item.image}`}
                                                    alt={item.name}
                                                    className="object-cover w-20 h-12 rounded-lg sm:h-16 sm:w-24"
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold truncate sm:text-md">
                                                        {item.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground sm:text-sm">
                                                        {`${(item.price || 0).toLocaleString('vi-VN')}đ`}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-center col-span-2">
                                            <UpdateOrderQuantitySelector cartItem={item} />
                                        </div>
                                        <div className="col-span-2 text-center">
                                            <span className="text-sm font-semibold text-primary">
                                                {`${((item.price || 0) * item.quantity).toLocaleString('vi-VN')}đ`}
                                            </span>
                                        </div>
                                        <div className="flex justify-center col-span-1">
                                            <RemoveOrderItemInUpdateOrderDialog cartItem={item} />
                                        </div>
                                    </div>
                                    <UpdateOrderNoteInput cartItem={item} />
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Note */}
                    <div className="flex items-end justify-between">
                        <div className="flex items-center gap-1">
                            <CircleAlert size={14} className="text-destructive" />
                            <span className="text-xs italic text-destructive">
                                {t('order.selectTableNote')}
                            </span>
                        </div>
                    </div>
                    {/* Table select */}
                    <UpdateOrderSheet />
                    <ClientUpdateOrderTableSelect defaultValue={orderItems.table} />
                    {/* <PaymentMethodSelect defaultValue={orderItems.paymentMethod || ''} /> */}
                    <div className="flex justify-end py-4">
                        <div className="w-full sm:max-w-[10rem]">
                            <ConfirmUpdateOrderDialog />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex h-[calc(51vh)] flex-col items-center justify-center gap-4 text-center">
                    {/* Empty Cart Icon */}
                    <ShoppingBag size={64} className="text-muted-foreground" />

                    {/* Message */}
                    <p className="text-lg text-muted-foreground">{t('order.noOrders')}</p>

                    {/* Navigation Button */}
                    <NavLink to={ROUTE.CLIENT_MENU}>
                        <Button>{t('order.backToMenu')}</Button>
                    </NavLink>
                </div>
            )}
        </div>
    )
}
