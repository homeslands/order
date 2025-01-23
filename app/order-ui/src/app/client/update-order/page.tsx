import _ from 'lodash'
import { NavLink, useParams } from 'react-router-dom'
import {
    CircleAlert,
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
import { ROUTE } from '@/constants'
import { Button } from '@/components/ui'
import { UpdateOrderSheet } from '@/components/app/sheet'
import { useOrderBySlug, useUpdateOrderType } from '@/hooks'
import UpdateOrderSkeleton from '../skeleton/page'
import { OrderTypeSelect } from '@/components/app/select'
import { IUpdateOrderTypeRequest, OrderTypeEnum } from '@/types'
import { showToast } from '@/utils'

export default function ClientUpdateOrderPage() {
    const { t } = useTranslation('menu')
    const { t: tToast } = useTranslation('toast')
    const { slug } = useParams()
    const { mutate: updateOrderType } = useUpdateOrderType()
    const { data: order, isPending, refetch } = useOrderBySlug(slug as string)
    if (isPending) {
        return <UpdateOrderSkeleton />
    }
    const orderItems = order?.result

    const handleRemoveOrderItemSuccess = () => {
        refetch()
    }

    const handleOnAddNewOrderItemSuccess = () => {
        refetch()
    }

    const handleUpdateOrderTypeSuccess = () => {
        console.log('Update order type success')
        refetch()
    }

    const handleChangeOrderType = (orderType: string) => {
        // Update order type
        if (orderType === OrderTypeEnum.AT_TABLE) {
            const params: IUpdateOrderTypeRequest = {
                type: orderType,
                table: orderItems?.table.slug || null,
            }
            updateOrderType({ slug: slug as string, params }, {
                onSuccess: () => {
                    showToast(tToast('order.updateOrderTypeSuccess'))
                    refetch()
                }
            })
        } else {
            const params = {
                type: orderType,
                table: null,
            }
            updateOrderType({ slug: slug as string, params }, {
                onSuccess: () => {
                    showToast(tToast('order.updateOrderTypeSuccess'))
                    refetch()
                }
            })
        }
    }

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
            {/* Order type selection */}
            <div className="flex flex-col gap-4 lg:flex-row">
                {/* Left content */}
                <div className="w-full lg:w-1/2">
                    <UpdateOrderSheet onAddNewOrderItemSuccess={handleOnAddNewOrderItemSuccess} />
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
                    <ClientUpdateOrderTableSelect onSuccess={handleUpdateOrderTypeSuccess} order={orderItems} defaultValue={orderItems?.table !== null ? orderItems?.table.slug : ''} />
                    {/* <ClientTableSelect /> */}
                </div>

                {/* Right content */}
                <div className="w-full lg:w-1/2">
                    <OrderTypeSelect onChange={handleChangeOrderType} orderItems={orderItems} />
                    {/* Table list order items */}
                    <div className="mt-5">
                        <div className="grid grid-cols-7 px-4 py-3 mb-4 text-sm font-thin border rounded-md bg-muted/60">
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
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold truncate sm:text-md">
                                                        {item.variant.product.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground sm:text-sm">
                                                        {`${(item.variant.price || 0).toLocaleString('vi-VN')}đ`}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-center col-span-2">
                                            <UpdateOrderQuantitySelector cartItem={item} />
                                        </div>
                                        <div className="col-span-2 text-center">
                                            <span className="text-sm font-semibold text-primary">
                                                {`${((item.variant.price || 0) * item.quantity).toLocaleString('vi-VN')}đ`}
                                            </span>
                                        </div>
                                        <div className="flex justify-center col-span-1">
                                            <RemoveOrderItemInUpdateOrderDialog onSubmit={handleRemoveOrderItemSuccess} orderItem={item} />
                                        </div>
                                    </div>
                                    <UpdateOrderNoteInput orderItem={item} />
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Button */}
                    <div className="flex justify-end w-full mt-4">
                        <ConfirmUpdateOrderDialog />
                    </div>
                </div>
            </div>
        </div>
    )
}
