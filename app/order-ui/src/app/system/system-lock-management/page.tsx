import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { LockOpen, Lock, ChevronDown, ChevronRight } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'

import {
  Badge,
  Skeleton,
} from '@/components/ui'
import {
  useGetSystemFeatureFlagGroups,
} from '@/hooks'
import { IFeatureLockGroup } from '@/types'
import { ChangeFeatureLockStatusDialog, ChangeParentFeatureLockStatusDialog } from '@/components/app/dialog'

export default function SystemLockManagementPage() {
  const { t } = useTranslation(['system'])
  const { t: tHelmet } = useTranslation('helmet')

  const [localFlags, setLocalFlags] = useState<IFeatureLockGroup[]>([])
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [collapsedFeatures, setCollapsedFeatures] = useState<Set<string>>(new Set())

  const {
    data: systemFeatureFlagsGroupsResponse,
    isLoading,
  } = useGetSystemFeatureFlagGroups()
  const systemFeatureFlagsGroups = useMemo(
    () => (systemFeatureFlagsGroupsResponse && systemFeatureFlagsGroupsResponse?.result) || [],
    [systemFeatureFlagsGroupsResponse],
  )

  // Initialize local state when data loads
  useEffect(() => {
    if (systemFeatureFlagsGroups.length > 0) {
      setLocalFlags([...systemFeatureFlagsGroups])
    }
  }, [systemFeatureFlagsGroups])

  const getFeatureDisplayName = (name: string) => {
    // Convert to lowercase and replace underscores with underscores for i18n key
    const i18nKey = `system.lockFeature.${name.toLowerCase()}`
    return t(i18nKey, { defaultValue: name })
  }

  const getFeatureDescription = (name: string, fallbackDescription?: string) => {
    // Try to get translated description first
    const i18nKey = `system.lockFeature.${name.toLowerCase()}_description`
    const translatedDescription = t(i18nKey, { defaultValue: null })

    // Return translated description if exists, otherwise fallback to API description
    return translatedDescription || fallbackDescription || ''
  }

  const toggleGroupCollapse = (groupName: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupName)) {
        newSet.delete(groupName)
      } else {
        newSet.add(groupName)
      }
      return newSet
    })
  }

  const toggleFeatureCollapse = (featureSlug: string) => {
    setCollapsedFeatures(prev => {
      const newSet = new Set(prev)
      if (newSet.has(featureSlug)) {
        newSet.delete(featureSlug)
      } else {
        newSet.add(featureSlug)
      }
      return newSet
    })
  }

  return (
    <div className="grid grid-cols-1 gap-4 h-full">
      <Helmet>
        <meta charSet="utf-8" />
        <title>{tHelmet('helmet.system.title')}</title>
        <meta
          name="description"
          content={tHelmet('helmet.system.title')}
        />
      </Helmet>

      <div className="flex justify-between items-center">
        <span className="flex gap-2 items-center text-lg">
          <LockOpen />
          {t('system.lockFeature.title')}
        </span>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-lg border bg-muted/20">
                <div className="space-y-2">
                  <Skeleton className="w-40 h-5" />
                  <Skeleton className="w-64 h-3" />
                </div>
              </div>
              <div className="ml-6 space-y-3">
                {Array.from({ length: 2 }).map((_, featureIndex) => (
                  <div key={featureIndex} className="space-y-2">
                    <div className="flex justify-between items-center p-3 rounded-lg border">
                      <div className="space-y-1">
                        <Skeleton className="w-32 h-4" />
                        <Skeleton className="w-48 h-3" />
                      </div>
                      <Skeleton className="w-12 h-6" />
                    </div>
                    <div className="ml-4 space-y-2">
                      {Array.from({ length: 2 }).map((_, childIndex) => (
                        <div key={childIndex} className="flex justify-between items-center p-2 rounded-lg border bg-muted/20">
                          <div className="space-y-1">
                            <Skeleton className="w-24 h-3" />
                            <Skeleton className="w-40 h-2" />
                          </div>
                          <Skeleton className="w-10 h-5" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : localFlags.length > 0 ? (
          localFlags.map((group) => (
            <div key={group.name} className="space-y-4 rounded-lg border">
              {/* Group Header */}
              <div className="flex items-center gap-3 p-4 rounded-t-lg border bg-muted cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => toggleGroupCollapse(group.name)}>
                <div className="flex items-center gap-2">
                  {collapsedGroups.has(group.name) ? (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                  <h3 className="text-lg font-semibold text-muted-foreground">
                    {getFeatureDisplayName(group.name)}
                  </h3>
                </div>
                <Badge
                  variant={
                    group.features.every((feature) => feature.isLocked)
                      ? 'destructive'
                      : group.features.every((feature) => !feature.isLocked)
                        ? 'default'
                        : 'secondary'
                  }
                  className={`ml-auto ${group.features.every((feature) => !feature.isLocked)
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : group.features.some((feature) => !feature.isLocked) && group.features.some((feature) => feature.isLocked)
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                      : ''
                    }`}
                >
                  {group.features.every((feature) => feature.isLocked)
                    ? t('system.lockFeature.locked')
                    : group.features.every((feature) => !feature.isLocked)
                      ? t('system.lockFeature.unlocked')
                      : `${group.features.filter((feature) => feature.isLocked).length}/${group.features.length}`}
                </Badge>
              </div>

              {/* Features in Group */}
              {!collapsedGroups.has(group.name) && (
                <div className="space-y-4 ml-4">
                  {group.features.map((feature) => (
                    <div key={feature.name} className="space-y-3">
                      {/* Main Feature */}
                      <div className="flex justify-between items-center p-4 transition-colors">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            {feature.children && feature.children.length > 0 ? (
                              <div
                                className="cursor-pointer hover:bg-muted/50 rounded p-1 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleFeatureCollapse(feature.slug)
                                }}
                              >
                                {collapsedFeatures.has(feature.slug) ? (
                                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                )}
                              </div>
                            ) : (
                              feature.isLocked ? (
                                <Lock className="w-4 h-4 text-red-500" />
                              ) : (
                                <LockOpen className="w-4 h-4 text-green-500" />
                              )
                            )}
                            <h4 className="font-medium text-base">
                              {getFeatureDisplayName(feature.name)}
                            </h4>
                            <Badge
                              variant={feature.isLocked ? 'destructive' : 'default'}
                              className={`text-xs ${!feature.isLocked ? 'bg-green-500 hover:bg-green-600' : ''}`}
                            >
                              {feature.isLocked
                                ? t('system.lockFeature.locked')
                                : t('system.lockFeature.unlocked')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground ml-5">
                            {getFeatureDescription(feature.name, feature.description)}
                          </p>
                        </div>
                        <div className="ml-4">
                          <ChangeParentFeatureLockStatusDialog featureSlug={feature.slug} isLocked={feature.isLocked} />
                        </div>
                      </div>

                      {/* Children Features */}
                      {feature.children && feature.children.length > 0 && !collapsedFeatures.has(feature.slug) && (
                        <div className="ml-6 space-y-2">
                          {feature.children.map((child) => (
                            <div key={child.name} className="flex justify-between items-center p-3 transition-colors">
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-3">
                                  {child.isLocked ? (
                                    <Lock className="w-3 h-3 text-red-500" />
                                  ) : (
                                    <LockOpen className="w-3 h-3 text-green-500" />
                                  )}
                                  <span className="text-sm font-medium">
                                    {getFeatureDisplayName(child.name)}
                                  </span>
                                  <Badge
                                    variant={child.isLocked ? 'destructive' : 'default'}
                                    className={`text-xs ${!child.isLocked ? 'bg-green-500 hover:bg-green-600' : ''}`}
                                  >
                                    {child.isLocked
                                      ? t('system.lockFeature.locked')
                                      : t('system.lockFeature.unlocked')}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground ml-4">
                                  {getFeatureDescription(child.name, child.description)}
                                </p>
                              </div>
                              <div className="ml-3">
                                <ChangeFeatureLockStatusDialog featureSlug={child.slug} isLocked={child.isLocked} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <Lock className="w-12 h-12 text-muted-foreground/50" />
              <p className="text-muted-foreground text-lg">
                {t('system.lockFeature.noFeatureFlags')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
