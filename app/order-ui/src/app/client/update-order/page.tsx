import { useCallback, useEffect, useState } from 'react'
import _ from 'lodash'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import {
    CircleAlert,
    ShoppingCartIcon,
    Trash2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
    RemoveOrderItemInUpdateOrderDialog,
} from '@/components/app/dialog'
import { ROUTE, VOUCHER_TYPE } from '@/constants'
import { Button, ScrollArea } from '@/components/ui'
import { VoucherListSheetInUpdateOrder } from '@/components/app/sheet'
import { useOrderBySlug, useUpdateOrderType } from '@/hooks'
import UpdateOrderSkeleton from '../skeleton/page'
import { OrderTypeInUpdateOrderSelect } from '@/components/app/select'
import { ITable, IUpdateOrderTypeRequest, OrderTypeEnum } from '@/types'
import { formatCurrency, showToast } from '@/utils'
import { ClientMenuTabs } from '@/components/app/tabs'
import TableSelect from '@/components/app/select/table-select'
import UpdateOrderQuantity from './components/update-quantity'
import { UpdateOrderItemNoteInput, UpdateOrderNoteInput } from './components'
import { OrderCountdown } from '@/components/app/countdown/OrderCountdown'

export default function ClientUpdateOrderPage() {
    const { t } = useTranslation('menu')
    const { t: tHelmet } = useTranslation('helmet')
    const { t: tToast } = useTranslation('toast')
    const { slug } = useParams()
    const { mutate: updateOrderType } = useUpdateOrderType()
    const { data: order, isPending, refetch } = useOrderBySlug(slug as string)
    const [selectedTable, setSelectedTable] = useState<ITable | null>(null)
    const [type, setType] = useState<string>("")
    const navigate = useNavigate()
    const [isExpired, setIsExpired] = useState<boolean>(false)
    useEffect(() => {
        if (order?.result) {
            setSelectedTable(order?.result.table)
            setType(order?.result.type)
        }
    }, [order])
    const orderItems = order?.result

    const originalTotal = orderItems
        ? orderItems.orderItems.reduce((sum, item) => sum + item.variant.price * item.quantity, 0)
        : 0;


    // calculate discount base on promotion
    const discount = orderItems?.orderItems.reduce((sum, item) => sum + (item.promotion ? item.variant.price * item.quantity * (item.promotion.value / 100) : 0), 0)

    const voucherValue = orderItems?.voucher?.type === VOUCHER_TYPE.PERCENT_ORDER
        ? (originalTotal - (discount || 0)) * (orderItems?.voucher?.value || 0) / 100
        : orderItems?.voucher?.value || 0

    const handleRemoveOrderItemSuccess = () => {
        refetch()
    }

    const handleUpdateOrderTypeSuccess = () => {
        refetch()
    }

    const handleUpdateOrderNoteSuccess = () => {
        refetch()
    }
    const handleExpire = useCallback((value: boolean) => {
        setIsExpired(value)
    }, [])

    const handleClickPayment = () => {
        // Update order type
        let params: IUpdateOrderTypeRequest | null = null
        if (type === OrderTypeEnum.AT_TABLE) {
            params = { type: type, table: selectedTable?.slug || null, voucher: orderItems?.voucher?.slug || null }
        } else {
            params = { type: type, table: null, voucher: orderItems?.voucher?.slug || null }
        }
        updateOrderType({ slug: slug as string, params }, {
            onSuccess: () => {
                showToast(tToast('order.updateOrderTypeSuccess'))
                navigate(`${ROUTE.CLIENT_PAYMENT}?order=${orderItems?.slug}`)
                refetch()
            }
        })
    }
    if (isPending) { return <UpdateOrderSkeleton /> }

    if (isExpired) {
        return (
            <div className="container py-20 lg:h-[60vh]">
                <div className="flex flex-col gap-5 justify-center items-center">
                    <ShoppingCartIcon className="w-32 h-32 text-primary" />
                    <p className="text-center text-[13px] sm:text-sm">
                        {t('order.noOrders')}
                    </p>
                    <NavLink to={ROUTE.CLIENT_MENU}>
                        <Button variant="default">
                            {t('order.backToMenu')}
                        </Button>
                    </NavLink>
                </div>
            </div>
        )
    }

    return (
        <div className={`container py-10`}>
            <Helmet>
                <meta charSet='utf-8' />
                <title>
                    {tHelmet('helmet.updateOrder.title')}
                </title>
                <meta name='description' content={tHelmet('helmet.updateOrder.title')} />
            </Helmet>
            <OrderCountdown createdAt={order?.result.createdAt || "Sat Jan 01 2000 07:00:00 GMT+0700 (Indochina Time)"} setIsExpired={handleExpire} />
            {/* Order type selection */}
            {order?.result &&
                <div className="flex flex-col-reverse gap-4 lg:flex-row">
                    {/* Left content */}
                    <div className="w-full lg:w-3/5">
                        {/* Note */}
                        <div className="flex justify-between items-end">
                            <div className="flex gap-1 items-center">
                                <CircleAlert size={14} className="text-destructive" />
                                <span className="text-xs italic text-destructive">
                                    {t('order.selectTableNote')}
                                </span>
                            </div>
                        </div>

                        {/* Menu & Table select */}
                        <ClientMenuTabs onSuccess={handleUpdateOrderTypeSuccess} />
                    </div>

                    {/* Right content */}
                    <div className="w-full sm:mt-8 lg:w-2/5">
                        <OrderTypeInUpdateOrderSelect onChange={(value: string) => setType(value)} typeOrder={type} />

                        {type === OrderTypeEnum.AT_TABLE &&
                            <div className='mt-5'>
                                <TableSelect tableOrder={orderItems?.table} onTableSelect={(table: ITable) => setSelectedTable(table)} />
                            </div>
                        }
                        {/* Table list order items */}
                        <ScrollArea className="h-fit sm:h-[calc(60vh)] sm:pr-4">
                            <div className="mt-5">
                                <div className="grid grid-cols-7 px-4 py-3 mb-4 text-sm font-thin rounded-md border bg-muted/60">
                                    <span className="col-span-2">{t('order.product')}</span>
                                    <span className="col-span-2 text-center">
                                        {t('order.quantity')}
                                    </span>
                                    <span className="col-span-2 text-center">
                                        {t('order.grandTotal')}
                                    </span>
                                    <span className="flex col-span-1 justify-center">
                                        <Trash2 size={18} />
                                    </span>
                                </div>

                                <div className="flex flex-col rounded-md border">
                                    {orderItems?.orderItems.map((item) => (
                                        <div key={item.slug} className="grid gap-2 items-center px-4 py-2 mt-1 w-full rounded-md">
                                            <div key={`${item.slug}`} className="grid flex-row grid-cols-7 items-center w-full">
                                                <div className="flex col-span-2 gap-1 w-full">
                                                    <div className="flex flex-col gap-2 justify-start items-center sm:flex-row sm:justify-center">
                                                        <div className="flex flex-col">
                                                            <span className="text-[14px] font-bold truncate sm:text-sm mb-2">
                                                                {item.variant.product.name}
                                                                <span className='text-muted-foreground'> - Size {item.variant.size.name.toLocaleUpperCase()}</span>
                                                            </span>
                                                            {item?.promotion ? (
                                                                <div className='flex gap-1 items-center'>
                                                                    <span className="text-xs line-through text-muted-foreground sm:text-sm">
                                                                        {`${formatCurrency(item?.variant?.price)}`}
                                                                    </span>
                                                                    <span className="text-xs font-extrabold text-primary sm:text-base">
                                                                        {`${formatCurrency(item?.promotion ? item?.variant?.price * (1 - item?.promotion?.value / 100) : item?.variant?.price)}`}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <div className='flex gap-1 items-center'>
                                                                    <span className="text-xs text-primary sm:text-base">
                                                                        {`${formatCurrency(item?.variant?.price)}`}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex col-span-2 justify-center items-end h-full">
                                                    <UpdateOrderQuantity orderItem={item} onSuccess={refetch} />
                                                </div>
                                                <div className="col-span-2 h-full">
                                                    <span className="flex justify-center items-end h-full text-sm font-semibold text-primary">
                                                        {`${formatCurrency(item?.promotion ? item?.variant?.price * (1 - item?.promotion?.value / 100) * item.quantity : item?.variant?.price * item.quantity)}`}
                                                    </span>
                                                </div>
                                                <div className="flex col-span-1 justify-center items-end h-full" >
                                                    <RemoveOrderItemInUpdateOrderDialog onSubmit={handleRemoveOrderItemSuccess} orderItem={item} />
                                                </div>
                                            </div>
                                            <UpdateOrderItemNoteInput orderItem={item} />
                                        </div>
                                    ))}
                                </div>
                                {/* order note */}
                                <div className="flex flex-col items-end py-4 mt-4 border-t border-muted-foreground/40">
                                    <UpdateOrderNoteInput onSuccess={handleUpdateOrderNoteSuccess} order={orderItems} />
                                </div>
                                <VoucherListSheetInUpdateOrder defaultValue={orderItems || undefined} onSuccess={refetch} />
                                <div className="flex flex-col items-end pt-4 mt-4 border-t border-muted-foreground/40">
                                    <div className="space-y-1 w-2/3">
                                        <div className="grid grid-cols-5">
                                            <span className="col-span-3 text-sm text-muted-foreground">{t('order.total')}:</span>
                                            <span className="col-span-2 text-sm text-right text-muted-foreground">
                                                {/* {formatCurrency(orderItems ? orderItems.subtotal : 0)} */}
                                                {/* {formatCurrency(orderItems?.subtotal || 0)} */}
                                                {formatCurrency(originalTotal)}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-5">
                                            <span className="col-span-3 text-sm text-muted-foreground">{t('order.discount')}:</span>
                                            <span className="col-span-2 text-sm text-right text-muted-foreground">
                                                - {formatCurrency(discount || 0)}
                                                {/* {formatCurrency(orderItems?.voucher ? (orderItems.subtotal * (orderItems.voucher.value || 0)) / 100 : 0)} */}
                                            </span>
                                        </div>
                                        {order?.result.voucher &&
                                            <div className="flex justify-between pb-4 w-full border-b">
                                                <h3 className="text-sm italic font-medium text-green-500">
                                                    {t('order.voucher')}
                                                </h3>
                                                <p className="text-sm italic font-semibold text-green-500">
                                                    - {`${formatCurrency(voucherValue)}`}
                                                </p>
                                            </div>}

                                        <div className="grid grid-cols-5 pt-2 mt-4 border-t">
                                            <span className="col-span-3 text-lg font-bold">{t('order.subtotal')}:</span>
                                            <span className="col-span-2 font-semibold text-right text-md text-primary sm:text-2xl">
                                                {formatCurrency(orderItems ? (orderItems.subtotal) : 0)}
                                            </span>
                                        </div>
                                        {/* <span className="text-xs text-muted-foreground">({t('order.vat')})</span> */}
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>

                        {order?.result?.status === "pending" &&
                            <div className="flex justify-end mt-4 w-full">
                                <Button
                                    disabled={(type === OrderTypeEnum.AT_TABLE && !selectedTable) || orderItems?.orderItems.length === 0}
                                    onClick={handleClickPayment}>{t('order.continueToPayment')}</Button>
                            </div>}
                    </div>
                </div>
            }
        </div>
    )
}
