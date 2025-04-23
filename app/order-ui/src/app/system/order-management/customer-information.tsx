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
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <div className="flex flex-col col-span-1 gap-1 justify-start items-start text-muted-foreground sm:pr-2 sm:border-r-2">
        <div className="grid grid-cols-5 gap-1 w-full">
          <span className="col-span-2 text-sm font-bold text-left">
            {t('order.customerName')}
          </span>
          <span className="col-span-3 text-sm text-right">
            {orderDetailData?.owner?.firstName}{' '}
            {orderDetailData?.owner?.lastName}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1 w-full">
          <span className="col-span-2 text-sm font-bold text-left">
            {t('order.orderDate')}
          </span>
          <span className="col-span-3 text-sm text-right">
            {orderDetailData?.createdAt
              ? moment(orderDetailData?.createdAt).format('hh:mm DD/MM/YYYY')
              : ''}
          </span>
        </div>
        {/* <div className="grid grid-cols-2">
      <span className="col-span-1 text-xs font-semibold text-left">
        {t('order.phoneNumber')}
      </span>
      <span className="col-span-1 text-xs text-left">
        {orderDetailData?.owner?.phonenumber}
      </span>
    </div> */}
      </div>
      <div className="col-span-1 text-muted-foreground">
        <div className="grid grid-cols-5 gap-1 w-full">
          <span className="col-span-3 text-sm font-bold text-left">
            {t('order.deliveryMethod')}
          </span>
          <span className="col-span-2 text-sm text-right">
            {orderDetailData?.type
              ? orderDetailData.type === OrderTypeEnum.AT_TABLE
                ? t('order.dineIn')
                : t('order.takeAway')
              : null}
          </span>
        </div>
        {orderDetailData?.type === OrderTypeEnum.AT_TABLE && (
          <div className="grid grid-cols-5 gap-1 w-full">
            <span className="col-span-3 text-sm font-bold text-left">
              {t('order.tableNumber')}
            </span>
            <span className="col-span-2 text-sm text-right">
              {orderDetailData?.table?.name}
            </span>
          </div>
        )}
      </div>
      <div className="col-span-1 text-muted-foreground">
        <div className="grid grid-cols-5 gap-1 w-full">
          <span className="col-span-3 text-sm font-bold text-left">
            {t('order.note')}
          </span>
          <span className="col-span-2 text-sm text-right">
            {orderDetailData?.description}
          </span>
        </div>
      </div>
    </div>

  )
}
