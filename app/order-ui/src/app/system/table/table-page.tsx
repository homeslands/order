import { useTranslation } from 'react-i18next'

import { CreateTableDialog } from '@/components/app/dialog'
import { useTables } from '@/hooks'
import { TableItem } from './table-item'
import { useUserStore } from '@/stores'

export default function TablePage() {
  const { t } = useTranslation(['table'])
  const { getUserInfo } = useUserStore()
  const { data: tables } = useTables(getUserInfo()?.branch.slug)

  return (
    <div className="flex h-screen flex-col pb-4">
      <div className="flex items-center justify-end gap-2 py-4">
        {/* <div>
          <label htmlFor="bg-image-upload">
            <Button variant="outline" className="gap-2" asChild>
              <div>
                <ImageIcon className="w-4 h-4" />
                {t('table.uploadBackgroundImage')}
              </div>
            </Button>
          </label>
          <input
            id="bg-image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div> */}
        <CreateTableDialog />
      </div>

      <div className="flex flex-col rounded-md border">
        <div className="flex flex-row gap-4 p-4">
          <div className="flex flex-row items-center gap-2">
            <div className="h-4 w-4 rounded-sm border bg-muted-foreground/10" />
            <span className="text-sm">{t('table.available')}</span>
          </div>
          <div className="flex flex-row items-center gap-2">
            <div className="h-4 w-4 rounded-sm bg-primary" />
            <span className="text-sm">{t('table.reserved')}</span>
          </div>
        </div>
        <div className="flex h-full w-full flex-row flex-wrap gap-4 p-4">
          {tables?.result.map((table) => (
            <TableItem key={table.slug} table={table} />
          ))}
        </div>
      </div>
    </div>
  )
}
