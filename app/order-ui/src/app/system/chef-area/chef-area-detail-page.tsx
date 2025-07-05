import { useParams } from 'react-router-dom'
import moment from 'moment'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'

import { useGetChefAreaBySlug, useGetChefAreaProducts, useGetPrinterForChefArea } from '@/hooks'
import { ChefAreaProductDetailItem } from './components'
import { Badge, DataTable } from '@/components/ui'
import { AddProductInChefAreaSheet } from '@/components/app/sheet'
import { useState } from 'react'
import { usePrintersColumns } from './DataTable/columns'
import { PrinterActionOptions } from './DataTable/actions'

export default function ChefAreaDetailPage() {
    const { t } = useTranslation(['chefArea'])
    const { t: tHelmet } = useTranslation('helmet')
    const { slug } = useParams()
    const { data, refetch: refetchChefArea } = useGetChefAreaBySlug(slug as string)
    const { data: printers, isLoading } = useGetPrinterForChefArea(slug as string)
    const [shouldRefetch, setShouldRefetch] = useState(false)

    const chefArea = data?.result
    const chefAreaBranch = data?.result?.branch.slug || ''
    const printerData = printers?.result || []

    const { data: chefAreaProducts, refetch: refetchChefAreaProducts } = useGetChefAreaProducts(chefArea?.slug || '')

    const chefAreaProductsData = chefAreaProducts?.result || []

    const handleSuccess = () => {
        refetchChefArea()
        refetchChefAreaProducts()
        setShouldRefetch(true)
        // Reset the refetch state after a short delay
        setTimeout(() => {
            setShouldRefetch(false)
        }, 100)
    }

    return (
        <div className="flex flex-col flex-1 w-full pb-2">
            <Helmet>
                <meta charSet='utf-8' />
                <title>
                    {tHelmet('helmet.chefArea.title')}
                </title>
                <meta name='description' content={tHelmet('helmet.chefArea.title')} />
            </Helmet>
            <span className="flex items-center justify-between text-lg">
                <div className='flex items-center gap-2'>
                    <SquareMenu />
                    {t('chefArea.title')}
                </div>

            </span>
            <div className="grid h-full grid-cols-1 gap-2">
                <div className='flex flex-col gap-2 p-4 mt-4 border rounded-md'>
                    <div className='flex items-center justify-between'>
                        <span className='text-xl font-extrabold'>{chefArea?.name}</span>
                        <Badge className='text-sm font-normal'>{chefArea?.branch.name}</Badge>
                    </div>
                    <div className='text-sm text-muted-foreground'>
                        {chefArea?.description}
                    </div>
                    <div className='mt-3 text-sm text-muted-foreground'>
                        {t('chefArea.createdAt')}: {moment(chefArea?.createdAt).format('DD/MM/YYYY')}
                    </div>
                </div>
                <div className="grid h-full grid-cols-1 gap-2">
                    <DataTable
                        isLoading={isLoading}
                        data={printerData || []}
                        columns={usePrintersColumns()}
                        pages={1}
                        actionOptions={PrinterActionOptions()}
                        onPageChange={() => { }}
                        onPageSizeChange={() => { }}
                    />
                </div>
                <div className='flex items-center justify-between text-lg font-bold'>
                    {t('chefArea.currentProduct')}
                    <AddProductInChefAreaSheet branch={chefAreaBranch} onSuccess={() => handleSuccess()} onRefetch={shouldRefetch} />
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {chefAreaProductsData.map((item) =>
                        // item.products.map((product) => (
                        <ChefAreaProductDetailItem key={item.slug} onSuccess={() => handleSuccess()} chefAreaProduct={item} />
                        // ))
                    )}
                </div>
            </div>
        </div>
    )
}
