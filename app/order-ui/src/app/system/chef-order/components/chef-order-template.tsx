import moment from 'moment';
import { Logo } from '@/assets/images';
import { IOrder } from '@/types';

interface InvoiceProps {
    order: IOrder | undefined;
}

export default function Invoice({ order }: InvoiceProps) {
    return (
        <div className="p-6 pt-4 text-base font-medium leading-relaxed text-black">
            {/* Logo + Header */}
            <div className="mb-4">
                <div className="flex justify-center items-center mb-2">
                    <img src={Logo} alt="logo" className="w-44" />
                </div>
                <p className="text-base font-semibold text-center">{order?.invoice?.branchAddress || ''}</p>
                <p className="text-sm text-center">
                    <span className="font-bold">Mã đơn: </span>
                    {order?.referenceNumber}
                </p>
            </div>

            {/* Info */}
            <div className="mb-4 space-y-1">
                <p className="text-sm">
                    <span className="font-bold">Thời gian: </span>
                    {moment(order?.createdAt).format('HH:mm:ss DD/MM/YYYY')}
                </p>
                <p className="text-sm">
                    <span className="font-bold">Bàn: </span>
                    <span className="capitalize">{order?.table?.name}</span>
                </p>
            </div>

            {/* Items */}
            <table className="mt-2 w-full text-base border-collapse">
                <thead>
                    <tr className="border-b-2 border-gray-700">
                        <th className="py-2 pl-1 w-1/2 text-left">Món</th>
                        <th className="py-2 w-1/6 text-center">SL</th>
                        <th className="py-2 pr-1 text-left">Ghi chú</th>
                    </tr>
                </thead>
                <tbody>
                    {order?.orderItems.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-300">
                            <td className="py-3 pl-1 text-sm font-medium">
                                {item?.variant?.product?.name}{' '}
                                <span className="text-xs text-gray-600 uppercase">
                                    ({item?.variant?.size?.name})
                                </span>
                            </td>
                            <td className="py-3 text-lg font-bold text-center">{item?.quantity}</td>
                            <td className="py-3 pr-1 text-sm font-semibold text-red-600">
                                {item?.note || ''}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
