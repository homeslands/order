import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { Switch } from '@/components/ui'
import { IBanner } from '@/types'
import { useUpdateBanner } from '@/hooks'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'

interface IBannerStatusSwitchProps {
    banner: IBanner
    disabled?: boolean
    onSuccess?: () => void
}

export default function BannerStatusSwitch({
    banner,
    disabled,
    onSuccess,
}: IBannerStatusSwitchProps) {
    const queryClient = useQueryClient()
    const { t: tToast } = useTranslation('toast')
    const { mutate: updateBanner } = useUpdateBanner()

    const handleToggle = () => {
        if (!banner.slug) return
        updateBanner(
            { slug: banner.slug, title: banner.title, content: banner.content, useButtonUrl: banner.useButtonUrl, isActive: !banner.isActive },

            {
                onSuccess: () => {
                    queryClient.invalidateQueries({
                        queryKey: [QUERYKEY.banners],
                        exact: false,
                        refetchType: 'all',
                    })
                    onSuccess?.()
                    showToast(tToast('toast.updateBannerSuccess'))
                },
            }
        )
    }

    return (
        <div className="flex items-center gap-2">
            <Switch
                checked={banner.isActive}
                onCheckedChange={handleToggle}
                disabled={disabled}
            />
        </div>
    )
}
