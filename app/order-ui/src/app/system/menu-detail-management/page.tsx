import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'
import moment from 'moment'

import { useSpecificMenu } from '@/hooks'
import { ProductDetailSkeleton } from '@/components/app/skeleton'
import { useState } from 'react'
import { CartToggleButton } from '@/components/app/button'
import { cn } from '@/lib'
import { AddMenuItem, MenuItemCard } from './components'

export default function MenuDetailManagementPage() {
  const [isCartOpen, setIsCartOpen] = useState(true)
  const { t } = useTranslation(['menu'])
  const { slug } = useParams()
  const { data: menuDetail, isLoading } = useSpecificMenu({
    slug: slug as string,
  })

  const menuDetailData = menuDetail?.result

  if (isLoading) {
    return <ProductDetailSkeleton />
  }

  return (
    <div>
      <div className="mb-4 flex w-full items-center gap-1 text-lg">
        <SquareMenu />
        {t('menu.title')}
        {' - '}
        {moment(menuDetailData?.date).format('DD/MM/YYYY')}
      </div>
      <div className="mb-4 flex justify-end pr-2">
        <CartToggleButton
          isCartOpen={isCartOpen}
          setIsCartOpen={setIsCartOpen}
        />
      </div>
      <div className="flex flex-row gap-2">
        {/* List menu items */}
        <div
          className={cn(
            `px-4 transition-all duration-300 ease-in-out`,
            isCartOpen ? 'hidden lg:block lg:w-1/2' : 'w-full',
          )}
        >
          <div
            className={`mt-4 grid grid-cols-1 gap-4 ${isCartOpen ? 'md:grid-cols-2' : 'md:grid-cols-5'} `}
          >
            {menuDetailData?.menuItems.map((item) => (
              <MenuItemCard menuItem={item} />
            ))}
          </div>
        </div>

        {/* Add menu items */}
        <div
          className={`border-l bg-background transition-all duration-300 ease-in-out ${
            isCartOpen ? 'w-full lg:w-1/2' : 'w-0 opacity-0'
          } sticky top-0 h-[calc(100vh-4rem)] overflow-y-auto`}
        >
          {isCartOpen && <AddMenuItem />}
        </div>
      </div>
    </div>
  )
}
