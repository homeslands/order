import { Sheet, SheetContent, SheetTrigger, Button } from '@/components/ui'
import { useState } from 'react'
import { CustomerCoinTabsContent } from '../tabscontent'
import { IUserInfo } from '@/types'
import { Coins } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface GiftCardTransactionSheetProps {
  user: IUserInfo
}

export default function GiftCardTransactionSheet({
  user,
}: GiftCardTransactionSheetProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const { t } = useTranslation(['customer'])

  return (
    <>
      {/* Gift Card Transaction Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild className="flex w-full justify-start">
          <Button
            variant="ghost"
            className="gap-1 px-2 text-sm"
            onClick={() => setSheetOpen(true)}
          >
            <Coins className="icon" />
            {t('customer.coinTransactionHistory')}
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className={`w-full overflow-auto bg-background pt-6`}
        >
          <CustomerCoinTabsContent userSlug={user.slug} />
        </SheetContent>
      </Sheet>
    </>
  )
}
