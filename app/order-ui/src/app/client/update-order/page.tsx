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
import { ROUTE } from '@/constants'
import { Button } from '@/components/ui'
import { VoucherListSheet } from '@/components/app/sheet'
import {  useOrderBySlug, useUpdateOrderType } from '@/hooks'
import UpdateOrderSkeleton from '../skeleton/page'
import { OrderTypeInUpdateOrderSelect } from '@/components/app/select'
import { ITable, IUpdateOrderTypeRequest, OrderTypeEnum } from '@/types'
import { formatCurrency, showToast } from '@/utils'
import { ClientMenuTabs } from '@/components/app/tabs'
import { useEffect, useState } from 'react'
import TableSelect from '@/components/app/select/table-select'
import UpdateOrderQuantity from './components/update-quantity'
import { UpdateOrderNoteInput } from './components'

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

    const discount = orderItems
        ? orderItems.orderItems.reduce(
            (sum, item) => sum + (item.promotion ? item.variant.price * item.quantity * (item.promotion.value / 100) : 0),
            0
        )
        : 0;


    const handleRemoveOrderItemSuccess = () => {
        refetch()
    }

    const handleUpdateOrderTypeSuccess = () => {
        refetch()
    }

    const handleClickPayment = () => {
        // Update order type
        let params: IUpdateOrderTypeRequest | null = null
        if (type === OrderTypeEnum.AT_TABLE) {
            params = { type: type, table: selectedTable?.slug || null, }
        } else {
            params = { type: type, table: null, }
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

    if (_.isEmpty(orderItems?.orderItems)) {
        return (
            <div className="container py-20 lg:h-[60vh]">
                <div className="flex flex-col items-center justify-center gap-5">
                    <ShoppingCartIcon className="w-32 h-32 text-primary" />
                    <p className="text-center text-[13px]">
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
            {/* Order type selection */}
            {order?.result &&
                <div className="flex flex-col gap-4 lg:flex-row">
                    {/* Left content */}
                    <div className="w-full lg:w-3/5">
                        {/* Note */}
                        <div className="flex items-end justify-between">
                            <div className="flex items-center gap-1">
                                <CircleAlert size={14} className="text-destructive" />
                                <span className="text-xs italic text-destructive">
                                    {t('order.selectTableNote')}
                                </span>
                            </div>
                        </div>

                        {/* Menu & Table select */}
                        <ClientMenuTabs onSuccess={handleUpdateOrderTypeSuccess} order={orderItems} defaultValue={orderItems?.table !== null ? orderItems?.table.slug : ''} />
                    </div>

                    {/* Right content */}
                    <div className="w-full lg:w-2/5">
                        <OrderTypeInUpdateOrderSelect onChange={(value: string) => setType(value)} typeOrder={type} />

                        {type === OrderTypeEnum.AT_TABLE &&
                            <div className='mt-5'>
                                <TableSelect tableOrder={orderItems?.table} onTableSelect={(table: ITable) => setSelectedTable(table)} />
                            </div>
                        }
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
                                                        {item?.promotion ? (
                                                            <div className='flex items-center gap-1'>
                                                                <span className="text-xs line-through text-muted-foreground sm:text-sm">
                                                                    {`${formatCurrency(item?.variant?.price)}`}
                                                                </span>
                                                                <span className="text-xs font-extrabold text-primary sm:text-base">
                                                                    {`${formatCurrency(item?.promotion ? item?.variant?.price * (1 - item?.promotion?.value / 100) : item?.variant?.price)}`}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className='flex items-center gap-1'>
                                                                <span className="text-xs text-primary sm:text-base">
                                                                    {`${formatCurrency(item?.variant?.price)}`}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-center col-span-2">
                                                <UpdateOrderQuantity orderItem={item} onSuccess={refetch} />
                                            </div><div className="col-span-2 text-center">
                                                <span className="text-sm font-semibold text-primary">
                                                    {`${formatCurrency(item?.promotion ? item?.variant?.price * (1 - item?.promotion?.value / 100) * item.quantity : item?.variant?.price * item.quantity)}`}
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
                            <VoucherListSheet defaultValue={orderItems?.voucher && orderItems.voucher.slug} />
                            <div className="flex flex-col items-end pt-4 mt-4 border-t border-muted-foreground/40">
                                <div className="w-2/3 space-y-1">
                                    <div className="grid grid-cols-5">
                                        <span className="col-span-3 text-sm text-muted-foreground">{t('order.total')}:</span>
                                        <span className="col-span-2 text-sm text-right text-muted-foreground">
                                            {/* {formatCurrency(orderItems ? orderItems.subtotal : 0)} */}
                                            {/* {formatCurrency(orderItems?.subtotal || 0)} */}
                                            {formatCurrency(originalTotal)}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-5">
                                        <span className="col-span-3 text-sm italic text-green-500">{t('order.discount')}:</span>
                                        <span className="col-span-2 text-sm italic text-right text-green-500">
                                            - {formatCurrency(discount)}
                                            {/* {formatCurrency(orderItems?.voucher ? (orderItems.subtotal * (orderItems.voucher.value || 0)) / 100 : 0)} */}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-5 pt-2 mt-4 border-t">
                                        <span className="col-span-3 text-lg font-bold">{t('order.subtotal')}:</span>
                                        <span className="col-span-2 font-semibold text-right text-md text-primary sm:text-2xl">
                                            {formatCurrency(orderItems ? (orderItems.subtotal) : 0)}
                                        </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">({t('order.vat')})</span>
                                </div>

                            </div>
                        </div>

                        {order?.result?.status === "pending" &&
                            <div className="flex justify-end w-full mt-4">
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
