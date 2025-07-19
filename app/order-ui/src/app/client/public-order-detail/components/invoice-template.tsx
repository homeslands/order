import moment from 'moment';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';

import { Logo } from '@/assets/images';
import { capitalizeFirstLetter, formatCurrency } from '@/utils';
import { IOrder } from '@/types';
import { PaymentMethod, VOUCHER_TYPE } from '@/constants';
import { CoinsIcon } from 'lucide-react';

interface InvoiceProps {
    order: IOrder | undefined
}

export default function Invoice({
    order,
}: InvoiceProps) {
    const { t } = useTranslation('menu')
    const originalTotal = order?.orderItems.reduce((sum, item) => sum + item.variant.price * item.quantity, 0) || 0;

    const discount = order
        ? order.orderItems.reduce(
            (sum, item) => sum + (item.promotion ? item.variant.price * item.quantity * (item.promotion.value / 100) : 0),
            0
        )
        : 0;

    const voucherDiscount = order?.voucher && order?.voucher.type === VOUCHER_TYPE.PERCENT_ORDER ? (originalTotal - discount || 0) * ((order?.voucher.value) / 100) : order?.voucher && order?.voucher.type === VOUCHER_TYPE.FIXED_VALUE ? order?.voucher.value : 0;

    // calculate loss
    const loss = order?.loss || 0;

    const isPointPayment = order?.payment?.paymentMethod === PaymentMethod.POINT;

    return (
        <div className="px-3 py-5 bg-white rounded-md dark:bg-transparent">
            {/* Logo */}
            <div className="mb-1">
                <div className="flex items-center justify-center">
                    <img src={Logo} alt="logo" className="w-52" />
                </div>
                <p className="text-sm text-center">{order?.invoice?.branchAddress || ''}</p>
                <div className="flex items-center justify-center py-4">
                    <QRCodeSVG value={order?.slug || ''} size={128} />
                </div>
                <p className="text-xs text-center">
                    <span>{t('order.slug')}</span>{' '}
                    <span>{order?.referenceNumber}</span>
                </p>
            </div>

            {/* Invoice info */}
            <div className="flex flex-col gap-2">
                <p className="text-xs">
                    <span className="font-bold">{t('order.orderTime')}:</span>{' '}
                    {moment(order?.createdAt).format('HH:mm:ss DD/MM/YYYY')}
                </p>
                {order?.table?.slug && (
                    <p className="text-xs">
                        <span className="font-bold">{t('order.table')}:</span>{' '}
                        <span className="capitalize">{order?.table?.name}</span>
                    </p>)}
                <p className="text-xs">
                    <span className="font-bold">{t('order.customer')}:</span> {order?.owner?.firstName} {order?.owner?.lastName}
                </p>
                {order?.owner?.slug !== order?.approvalBy?.slug && (
                    <p className="text-xs">
                        <span className="font-bold">{t('order.cashier')}:</span> {order?.approvalBy?.firstName} {order?.approvalBy?.lastName}
                    </p>)}
            </div>

            {/* Invoice items */}
            <table className="min-w-full mt-4 text-sm border-collapse table-auto">
                <thead>
                    <tr className="text-sm font-semibold text-left border-b border-dashed border-muted-foreground">
                        <th className="w-[35%] sm:w-[40%] py-2">{t('order.item')}</th>
                        <th className="w-[10%] sm:w-[5%] py-2 text-center">{t('order.itemQuantity')}</th>
                        <th className="w-[25%] py-2 text-right">{t('order.unitPrice')}</th>
                        <th className="w-[10%] sm:w-[15%] py-2 text-center">{t('menu.promotion')} (%)</th>
                        <th className="w-[30%] sm:w-[25%] py-2 text-right">{t('order.grandTotal')}</th>
                    </tr>
                </thead>
                <tbody>
                    {order?.orderItems.map((item, idx) => (
                        <>
                            <tr key={`item-${idx}`} className="text-xs border-b border-dashed border-muted-foreground sm:text-sm">
                                <td className="py-2">
                                    {item?.variant?.product?.name}{' '}
                                    <span className="uppercase">
                                        ({capitalizeFirstLetter(item?.variant?.size?.name)})
                                    </span>
                                </td>
                                <td className="py-2 text-center">{item?.quantity}</td>
                                <td className="py-2 text-right">
                                    {formatCurrency(item?.variant?.price || 0)}
                                </td>
                                <td className="py-2 text-center">{item?.promotion?.value || 0}</td>
                                <td className="py-2 text-right text-nowrap">
                                    {formatCurrency(item?.subtotal || 0)}
                                </td>
                            </tr>

                            {item?.note && (
                                <tr key={`note-${idx}`} className="border-b border-dashed border-muted-foreground">
                                    <td colSpan={5} className="py-1 sm:py-2 text-[11px] sm:text-xs text-muted-foreground italic bg-gray-50/50">
                                        📝 {t('order.note')}: {item.note}
                                    </td>
                                </tr>
                            )}
                        </>
                    ))}
                </tbody>


                {/* Payment Summary */}
                <tfoot className="text-sm">
                    <tr className="">
                        <td className="py-2" colSpan={3}>
                            {t('order.pttt')}
                        </td>
                        <td colSpan={3} className="py-2 font-semibold text-right">
                            {order?.payment?.paymentMethod === PaymentMethod.CASH
                                ? t('order.cash')
                                : order?.payment?.paymentMethod === PaymentMethod.BANK_TRANSFER
                                ? t('order.bankTransfer')
                                : t('order.point')}
                        </td>
                    </tr>
                    <tr>
                        <td className="py-2" colSpan={3}>
                            {t('order.estimatedTotal')}
                        </td>
                        <td colSpan={3} className="py-2 text-right">
                            {formatCurrency(originalTotal - discount || 0)}
                        </td>
                    </tr>
                    <tr>
                        <td className="py-2" colSpan={3}>
                            {t('order.discount')}
                        </td>
                        <td colSpan={3} className="py-2 text-right">
                            {formatCurrency(voucherDiscount || 0)}
                        </td>
                    </tr>
                    {isPointPayment && (
                        <tr>
                            <td className="py-2" colSpan={3}>
                                {t('order.deductedCoinAmount')}
                            </td>
                            <td colSpan={3} className="py-2 text-right">
                                {formatCurrency(order?.invoice?.amount, '')} <CoinsIcon className="inline h-4 w-4 text-primary" />
                            </td>
                        </tr>
                    )}
                    <tr>
                        <td className="py-2" colSpan={3}>
                            {t('order.invoiceAutoDiscountUnderThreshold')}
                        </td>
                        <td colSpan={3} className="py-2 text-right">
                            {formatCurrency(loss || 0)}
                        </td>
                    </tr>
                    <tr className="border-t-2 border-dashed border-muted-foreground">
                        <td className="py-3 text-base font-semibold" colSpan={3}>
                            {t('order.totalPayment')}
                        </td>
                        <td colSpan={3} className="py-3 text-xl font-bold text-right text-primary">
                            {isPointPayment ? formatCurrency(0): formatCurrency(order?.subtotal || 0)}
                        </td>
                    </tr>
                </tfoot>
            </table>


            {/* Invoice footer */}
            {/* <p className="mt-2 text-xs">
                Giá sản phẩm đã bao gồm VAT 10%. Vui lòng giữ lại hóa đơn, để
                xác thực đó là đơn hàng của bạn.
            </p> */}
            <span className='text-sm italic text-destructive'>
                {t('order.invoiceNote')}
            </span>
        </div>
    );
}
