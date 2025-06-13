import { useTranslation } from 'react-i18next'
import { CircleX } from 'lucide-react'
import { Button } from '@/components/ui'

interface ExpiredStateProps {
  onNavigateBack: () => void
}

export default function ExpiredState({ onNavigateBack }: ExpiredStateProps) {
  const { t } = useTranslation(['giftCard'])

  return (
    <div className="mx-auto min-h-screen max-w-5xl bg-white p-6">
      <div className="flex flex-col items-center justify-center gap-5 py-20">
        <CircleX className="h-32 w-32 text-destructive" />
        <p className="text-center text-muted-foreground">
          {t('giftCard.paymentExpired', 'Payment time has expired')}
        </p>
        <Button variant="default" onClick={onNavigateBack}>
          {t('giftCard.backToGiftCards', 'Back to Gift Cards')}
        </Button>
      </div>
    </div>
  )
}
