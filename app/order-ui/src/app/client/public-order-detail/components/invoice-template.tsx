import moment from 'moment';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';

import { Logo } from '@/assets/images';
import { formatCurrency } from '@/utils';
import { IOrder } from '@/types';
import { PaymentMethod } from '@/constants';

interface InvoiceProps {
    order: IOrder | undefined
}

export default function Invoice({
    order,
}: InvoiceProps) {
    const { t } = useTranslation('menu')
    const subtotalBeforeVoucher = order?.orderItems.reduce((acc, item) => acc + item.variant.price * item.quantity, 0);
    const voucherValue = order?.voucher?.value || 0;

    return (
        <div className="p-5 pt-0">
            {/* Logo */}
            <div className="mb-1">
                <div className="flex justify-center items-center">
                    <img src={Logo} alt="logo" className="w-52" />
                </div>
                <p className="text-sm text-center">{order?.invoice?.branchAddress || ''}</p>
                <div className="flex justify-center items-center py-4">
                    <QRCodeSVG value={order?.slug || ''} size={128} />
                </div>
                <p className="text-xs text-center">
                    <span>Mã đơn: </span>
                    <span>{order?.referenceNumber}</span>
                </p>
            </div>

            {/* Invoice info */}
            <div className="flex flex-col gap-2">
                <p className="text-xs">
                    <span className="font-bold">Thời gian:</span>{' '}
                    {moment(order?.createdAt).format('HH:mm:ss DD/MM/YYYY')}
                </p>
                <p className="text-xs">
                    <span className="font-bold">Bàn:</span>{' '}
                    <span className="capitalize">{order?.table?.name}</span>
                </p>
                <p className="text-xs">
                    <span className="font-bold">Khách hàng:</span> {order?.owner?.firstName} {order?.owner?.lastName}
                </p>
                <p className="text-xs">
                    <span className="font-bold">Thu ngân:</span> {order?.approvalBy?.firstName} {order?.approvalBy?.lastName}
                </p>
            </div>

            {/* Invoice items */}
            <table className="mt-4 min-w-full text-sm border-collapse table-auto">
                <thead>
                    <tr className="border-b border-black bg-white-100">
                        <th className="py-2 w-2/3 text-left">Món</th>
                        <th className="px-1 py-2 text-left">SL</th>
                        <th className="px-2 py-2 text-left">Đ.Giá</th>
                        <th className="px-2 py-2 text-left">K.Mãi(%)</th>
                        <th className="px-2 py-2 text-left">T.Tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {order?.orderItems.map((item, idx) => (
                        <tr key={idx} className="border-b border-black hover:bg-gray-50">
                            <td className="py-2 w-2/3 text-xs">
                                {item?.variant?.product?.name}{' '}
                                <span className="uppercase">({item?.variant?.size?.name})</span>
                            </td>
                            <td className="px-1 py-2 text-xs">{item?.quantity}</td>
                            <td className="px-2 py-2 text-xs">{formatCurrency(item?.variant?.price || 0)}</td>
                            <td className="px-2 py-2 text-xs text-center">{item?.promotion?.value || 0}</td>
                            <td className="px-2 py-2 text-xs">{formatCurrency(item?.subtotal || 0)}</td>
                        </tr>
                    ))}

                    <tr className="border-t border-black">
                        <td className="py-2 text-left">PTTT</td>
                        <td className="py-2 text-xs font-bold text-right" colSpan={4}>
                            {order?.payment?.paymentMethod === PaymentMethod.CASH ? t('order.cash') : t('order.transfer')}
                        </td>
                    </tr>
                    <tr className="border-t border-black">
                        <td className="py-2 text-left">Tổng cộng</td>
                        <td className="py-2 text-right" colSpan={4}>
                            {formatCurrency(subtotalBeforeVoucher || 0)}
                        </td>
                    </tr>
                    <tr className="border-t border-black">
                        <td className="py-2 text-left">Giảm giá(%)</td>
                        <td className="py-2 text-right" colSpan={4}>
                            {voucherValue}
                        </td>
                    </tr>
                    <tr className="border-t border-black">
                        <td className="py-2 text-left">Thành tiền</td>
                        <td className="py-2 text-xl font-bold text-right" colSpan={4}>
                            {formatCurrency(order?.subtotal || 0)}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Invoice footer */}
            <p className="mt-2 text-xs">
                Giá sản phẩm đã bao gồm VAT 10%. Vui lòng giữ lại hóa đơn, để
                xác thực đó là đơn hàng của bạn.
            </p>
            <span className='text-sm italic text-destructive'>
                {t('order.invoiceNote')}
            </span>
        </div>
    );
}
