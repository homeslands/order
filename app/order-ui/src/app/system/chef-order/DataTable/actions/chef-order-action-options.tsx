import { FC } from 'react'

import { ChefAreaSelect, ChefOrderStatusSelect } from '@/components/app/select'
import { IChefOrders } from '@/types'
import { DataTableActionOptionsProps } from '@/components/ui'
import { useSelectedChefOrderStore, useUserStore } from '@/stores'
import { useGetChefAreas } from '@/hooks'

export default function ChefOrderActionOptions(): FC<DataTableActionOptionsProps<IChefOrders>> {
  const { userInfo } = useUserStore()
  const { data } = useGetChefAreas(userInfo?.branch?.slug || '')
  const chefAreas = data?.result || []
  const { setChefOrderByChefAreaSlug, chefOrderByChefAreaSlug, setChefOrderStatus, chefOrderStatus } = useSelectedChefOrderStore()

  return function ActionOptions() {

    return (
      <>
        <ChefOrderStatusSelect
          onSelect={setChefOrderStatus}
          value={chefOrderStatus}
        />
        <ChefAreaSelect
          chefAreas={chefAreas}
          onSelect={setChefOrderByChefAreaSlug}
          value={chefOrderByChefAreaSlug}
        />
      </>
    )
  }
}