import { useRouteError, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui'
import { ROUTE } from '@/constants'
import { ErrorIllustration } from '@/assets/images'

export default function ErrorPage() {
  const error = useRouteError() as { statusText?: string; message?: string }
  const navigate = useNavigate()
  const { t } = useTranslation('common')

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-28 dark:bg-gray-900">
      {/* Hình ảnh minh họa lỗi */}
      <img
        src={ErrorIllustration}
        alt="Error Illustration"
        className="w-48 max-w-full mb-6"
      />

      {/* Tiêu đề lỗi */}
      <h1 className="mb-4 text-5xl font-bold text-destructive">
        {t('common.oops')}
      </h1>

      {/* Nội dung lỗi */}
      <p className="mb-2 text-lg text-muted-foreground dark:text-gray-300">
        {t('common.somethingWentWrong')}
      </p>

      {error?.statusText && (
        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          {error.statusText}
        </p>
      )}
      {error?.message && (
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          {error.message}
        </p>
      )}

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
