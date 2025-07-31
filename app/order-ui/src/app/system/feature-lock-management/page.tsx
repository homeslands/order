import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { LockOpen, Lock, Save, Unlock } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Switch,
  Button,
  Label,
  Badge,
  Skeleton,
} from '@/components/ui'
import {
  useGetFeatureFlagsByGroup,
  useBulkToggleFeatureFlags,
} from '@/hooks/use-gift-card'
import { GiftCardFlagGroup, GiftCardType } from '@/constants'
import { showToast } from '@/utils'
import { IGiftCardFlagFeature } from '@/types'

export default function FeatureLockManagementPage() {
  const { t } = useTranslation(['giftCard'])
  const { t: tHelmet } = useTranslation('helmet')
  const { t: tCommon } = useTranslation(['common'])

  const [localFlags, setLocalFlags] = useState<IGiftCardFlagFeature[]>([])
  const [hasChanges, setHasChanges] = useState(false)

  const { data: featureFlagsResponse, isLoading } = useGetFeatureFlagsByGroup(
    GiftCardFlagGroup.GIFT_CARD,
  )
  const featureFlags = useMemo(
    () => (featureFlagsResponse && featureFlagsResponse?.result) || [],
    [featureFlagsResponse],
  )

  const { mutate: bulkToggleFlags, isPending: isSaving } =
    useBulkToggleFeatureFlags()

  // Initialize local state when data loads
  useEffect(() => {
    if (featureFlags.length > 0) {
      setLocalFlags([...featureFlags])
      setHasChanges(false)
    }
  }, [featureFlags])

  const handleToggleFlag = (flagSlug: string) => {
    setLocalFlags((prev) =>
      prev.map((flag) =>
        flag.slug === flagSlug ? { ...flag, isLocked: !flag.isLocked } : flag,
      ),
    )
    setHasChanges(true)
  }

  const handleSave = () => {
    const updates = localFlags.map((flag) => ({
      slug: flag.slug,
      isLocked: flag.isLocked,
    }))

    bulkToggleFlags(updates, {
      onSuccess: () => {
        showToast(t('giftCard.giftCardFeatureFlag.updateSuccess'))
        setHasChanges(false)
      },
    })
  }

  const handleReset = () => {
    setLocalFlags([...featureFlags])
    setHasChanges(false)
  }

  const getGiftCardTypeLabel = (type: GiftCardType) => {
    const labels = {
      [GiftCardType.SELF]: t('giftCard.buyForSelf'),
      [GiftCardType.GIFT]: t('giftCard.giftToOthers'),
      [GiftCardType.BUY]: t('giftCard.purchaseGiftCard'),
      [GiftCardType.NONE]: t('giftCard.giftCardLock'),
    }
    return labels[type] || type
  }

  return (
    <div className="grid h-full grid-cols-1 gap-4">
      <Helmet>
        <meta charSet="utf-8" />
        <title>{tHelmet('helmet.giftCardFeatureFlag.title')}</title>
        <meta
          name="description"
          content={tHelmet('helmet.giftCardFeatureFlag.title')}
        />
      </Helmet>

      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-lg">
          <LockOpen />
          {t('giftCard.giftCardFeatureFlag.pageTitle')}
        </span>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isSaving || !hasChanges}
          >
            {tCommon('common.reset')}
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
            <Save className="mr-2 h-4 w-4" />
            {tCommon('common.save')}
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                {t('giftCard.giftCardFeatureFlag.featureControls')}
              </div>
              <div className="pr-4">
                {/* Switch Unlock/lock All */}
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="lock-all-switch"
                    className={`cursor-pointer font-semibold transition-colors ${
                      localFlags.every((flag) => flag.isLocked)
                        ? 'text-red-600 hover:text-red-700'
                        : 'text-green-600 hover:text-green-700'
                    }`}
                  >
                    {localFlags.every((flag) => flag.isLocked) ? (
                      <div className="flex items-center gap-1">
                        <Unlock className="h-4 w-4" />
                        {t('giftCard.giftCardFeatureFlag.unlockAll')}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Lock className="h-4 w-4" />
                        {t('giftCard.giftCardFeatureFlag.lockAll')}
                      </div>
                    )}
                  </Label>
                  <Switch
                    id="lock-all-switch"
                    checked={localFlags.every((flag) => flag.isLocked)}
                    disabled={isSaving || isLoading || localFlags.length === 0}
                    onCheckedChange={(checked) => {
                      setLocalFlags((prev) =>
                        prev.map((flag) => ({ ...flag, isLocked: checked })),
                      )
                      setHasChanges(true)
                    }}
                    className="data-[state=checked]:bg-destructive data-[state=unchecked]:bg-primary"
                  />
                </div>
              </div>
            </CardTitle>
            <CardDescription>
              {t('giftCard.giftCardFeatureFlag.featureControlsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>
              ))
            ) : localFlags.length > 0 ? (
              localFlags
                .sort((a, b) => a.order - b.order)
                .map((flag) => (
                  <div
                    key={flag.slug}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={flag.slug} className="font-medium">
                          {getGiftCardTypeLabel(flag.name)}
                        </Label>
                        <Badge
                          variant={flag.isLocked ? 'destructive' : 'default'}
                        >
                          {flag.isLocked
                            ? t('giftCard.giftCardFeatureFlag.locked')
                            : t('giftCard.giftCardFeatureFlag.unlocked')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t(
                          `giftCard.giftCardFeatureFlag.${flag.name.toLowerCase()}Description`,
                        )}
                      </p>
                    </div>
                    <Switch
                      id={flag.slug}
                      checked={flag.isLocked}
                      onCheckedChange={() => handleToggleFlag(flag.slug)}
                      disabled={isSaving}
                      className="data-[state=checked]:bg-destructive data-[state=unchecked]:bg-primary"
                    />
                  </div>
                ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                {t('giftCard.giftCardFeatureFlag.noFeatureFlags')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
