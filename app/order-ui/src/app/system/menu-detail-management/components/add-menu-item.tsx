import { useTranslation } from 'react-i18next'

import { Button, DataTable } from '@/components/ui'
import { useProducts } from '@/hooks'
import { useMenuItemStore } from '@/stores'
import { AddMultipleItemsDialog } from '@/components/app/dialog'
import { useProductColumns } from '../../order-history/DataTable/columns'

export function AddMenuItem() {
  const { t } = useTranslation(['menu'])
  const { t: tCommon } = useTranslation(['common'])
  const { getMenuItems, clearMenuItems } = useMenuItemStore()
  const { data: products, isLoading } = useProducts()

  const productsData = products?.result
  const menuItems = getMenuItems()

  return (
    <div className="bg-transparent backdrop-blur-md">
      <div className="flex items-center justify-between px-4 pt-2">
        <h1 className="text-lg font-medium">{t('menu.addMenuItem')}</h1>

        {/* Hiển thị số lượng items đã chọn */}
        {menuItems.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {t('menu.selectedItems', { count: menuItems.length })}
          </span>
        )}
      </div>

      {/* Product List */}
      <div className="grid h-96 grid-cols-1 gap-2 overflow-y-auto">
        <DataTable
          columns={useProductColumns()}
          data={productsData || []}
          isLoading={isLoading}
          pages={1}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
        />
      </div>

      {/* Hiển thị nút thêm khi có items được chọn */}
      {menuItems.length > 0 && (
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => clearMenuItems()}>
            {tCommon('common.cancel')}
          </Button>
          <AddMultipleItemsDialog products={menuItems} />
        </div>
      )}
    </div>
  )
}
