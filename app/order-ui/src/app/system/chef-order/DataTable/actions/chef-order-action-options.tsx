import { FC, useState } from 'react'

import { ChefAreaSelect } from '@/components/app/select'
import { IChefOrders } from '@/types'
import { DataTableActionOptionsProps } from '@/components/ui'
import { useUserStore } from '@/stores'
import { useGetChefAreas } from '@/hooks'

interface ChefOrderActionOptionsConfig {
  onSelect: (slug: string) => void
}

export default function ChefOrderActionOptions({ onSelect }: ChefOrderActionOptionsConfig): FC<DataTableActionOptionsProps<IChefOrders>> {
  const { userInfo } = useUserStore()
  const { data } = useGetChefAreas(userInfo?.branch?.slug || '')
  const chefAreas = data?.result || []
  const [selectedChefArea, setSelectedChefArea] = useState<string>('')

  return function ActionOptions() {
    const handleSelect = (slug: string) => {
      setSelectedChefArea(slug)
      onSelect(slug)
    }

    return (
      <>
        <ChefAreaSelect
          chefAreas={chefAreas}
          onSelect={handleSelect}
          value={selectedChefArea}
        />
      </>
    )
  }
}