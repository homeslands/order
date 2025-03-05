import PromotionTagImage from '@/assets/images/promotion-tag.svg'
import { useTranslation } from 'react-i18next'

export default function NewProductTag() {
    const { t } = useTranslation('product')
    return (
        <div className="absolute -top-2 -left-[0.3rem] z-50 w-[6rem]">
            <img src={PromotionTagImage} alt="promotion-tag" className="w-full" />
            <span className="absolute w-full text-sm font-medium text-white top-1.5 left-8">
                {t('product.isNew')}
            </span>
        </div>
    )
}