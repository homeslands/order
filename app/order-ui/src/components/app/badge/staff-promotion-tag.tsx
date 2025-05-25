import { useTranslation } from 'react-i18next'

import PromotionTagImage from '@/assets/images/promotion-tag.svg'
import { IPromotion } from '@/types'

export default function StaffPromotionTag({ promotion }: { promotion: IPromotion }) {
    const { t } = useTranslation('product')
    return (
        promotion && promotion.value > 0 ? (
            <div className="absolute -top-2 -left-[0.3rem] z-50 w-[6rem] sm:w-[6.5rem]">
                <img src={PromotionTagImage} alt="promotion-tag" className="w-full" />
                <span className="absolute left-3 w-full text-[0.6rem] font-medium text-white sm:left-3 sm:text-xs top-2 sm:top-2.5  ">
                    {t(`product.discount`)} {promotion.value}%
                </span>
            </div>
        ) : null
    )
}