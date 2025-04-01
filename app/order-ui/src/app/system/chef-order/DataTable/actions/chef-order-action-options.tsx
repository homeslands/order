import { FC, useState } from 'react'

import { ChefAreaSelect, ChefOrderStatusSelect } from '@/components/app/select'
import { IChefOrders } from '@/types'
import { DataTableActionOptionsProps } from '@/components/ui'
import { useUserStore } from '@/stores'
import { useGetChefAreas } from '@/hooks'

interface ChefOrderActionOptionsConfig {
  onSelect: (slug: string) => void
  onSelectStatus: (slug: string) => void
}

export default function ChefOrderActionOptions({ onSelect, onSelectStatus }: ChefOrderActionOptionsConfig): FC<DataTableActionOptionsProps<IChefOrders>> {
  const { userInfo } = useUserStore()
  const { data } = useGetChefAreas(userInfo?.branch?.slug || '')
  const chefAreas = data?.result || []
  const [selectedChefArea, setSelectedChefArea] = useState<string>('')
  const [selectedChefOrderStatus, setSelectedChefOrderStatus] = useState<string>('all')

  return function ActionOptions() {
    const handleSelect = (slug: string) => {
      setSelectedChefArea(slug)
      onSelect(slug)
    }

    const handleSelectStatus = (slug: string) => {
      setSelectedChefOrderStatus(slug)
      onSelectStatus(slug)
    }

    return (
      <>
        <ChefOrderStatusSelect
          onSelect={handleSelectStatus}
          value={selectedChefOrderStatus}
        />
        <ChefAreaSelect
          chefAreas={chefAreas}
          onSelect={handleSelect}
          value={selectedChefArea}
        />
      </>
    )
  }
}