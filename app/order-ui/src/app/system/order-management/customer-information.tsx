import { useTranslation } from 'react-i18next'
import moment from 'moment'

import { IOrder, OrderTypeEnum } from '@/types'

interface ICustomerInfoProps {
  orderDetailData?: IOrder
}

export default function CustomerInformation({
  orderDetailData,
}: ICustomerInfoProps) {
  const { t } = useTranslation(['menu'])
  return (
    <div className="grid grid-cols-1 gap-2 border-b-2 pb-6 sm:grid-cols-2">
      <div className="col-span-1 flex flex-col gap-1 text-muted-foreground sm:border-r-2">
        <div className="grid grid-cols-5 gap-1">
          {/* <span>
            {orderDetailData?.slug}
          </span> */}
          <span className="col-span-3 text-xs font-semibold">
            {t('order.customerName')}
          </span>
          <span className="col-span-2 text-xs">
            {orderDetailData?.owner?.firstName}{' '}
            {orderDetailData?.owner?.lastName}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1">
          <span className="col-span-3 text-xs font-semibold">
            {t('order.orderDate')}
          </span>
          <span className="col-span-2 text-xs">
            {orderDetailData?.createdAt
              ? moment(orderDetailData?.createdAt).format('hh:mm DD/MM/YYYY')
              : ''}
          </span>
        </div>
        {/* <div className="grid grid-cols-2">
          <span className="col-span-1 text-xs font-semibold">
            {t('order.phoneNumber')}
          </span>
          <span className="col-span-1 text-xs">
            {orderDetailData?.owner?.phonenumber}
          </span>
        </div> */}
      </div>
      <div className="col-span-1 text-muted-foreground">
        <div className="grid grid-cols-5 gap-1">
          <span className="col-span-3 text-xs font-semibold">
            {t('order.deliveryMethod')}
          </span>
          <span className="col-span-2 text-xs">
            {orderDetailData?.type
              ? orderDetailData.type === OrderTypeEnum.AT_TABLE
                ? t('order.dineIn')
                : t('order.takeAway')
              : null}
          </span>
        </div>
        {orderDetailData?.type === OrderTypeEnum.AT_TABLE && (
          <div className="grid grid-cols-5 gap-1">
            <span className="col-span-3 text-xs font-semibold">
              {t('order.tableNumber')}
            </span>
            <span className="col-span-2 text-xs">
              {orderDetailData?.table?.name}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
