import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui'
import { ROUTE } from '@/constants'
import { NotFoundIllustration } from '@/assets/images'

export default function ErrorPage() {
    const navigate = useNavigate()
    const { t } = useTranslation('common')

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gray-100 dark:bg-gray-900">
            {/* Hình ảnh minh họa lỗi */}
            <img
                src={NotFoundIllustration}
                alt="Error Illustration"
                className="w-48 max-w-full mb-6"
            />

            {/* Tiêu đề lỗi */}
            <h1 className="mb-2 text-3xl font-bold text-primary">
                {t('common.pageNotFound')}
            </h1>

            {/* Nội dung lỗi */}
            <p className="mb-4 text-muted-foreground/70 text-md dark:text-gray-300">
                {t('common.pageNotFoundDescription')}
            </p>

            {/* Nút điều hướng */}
            <div className="flex space-x-4">
                <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                >
                    {t('common.goBack')}
                </Button>
                <Button
                    onClick={() => navigate(ROUTE.HOME)}
                >
                    {t('common.goHome')}
                </Button>
            </div>
        </div>
    )
}
