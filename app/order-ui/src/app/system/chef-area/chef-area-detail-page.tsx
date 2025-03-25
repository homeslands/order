import { useParams } from 'react-router-dom'
import moment from 'moment'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'

import { useGetChefAreaBySlug, useGetChefAreaProducts } from '@/hooks'
import { ChefAreaProductDetailItem } from './components'
import { Badge } from '@/components/ui'
import { AddProductInChefAreaSheet } from '@/components/app/sheet'

export default function ChefAreaDetailPage() {
    const { t } = useTranslation(['chefArea'])
    const { t: tHelmet } = useTranslation('helmet')
    const { slug } = useParams()
    const { data } = useGetChefAreaBySlug(slug as string)

    const chefArea = data?.result

    const { data: chefAreaProducts } = useGetChefAreaProducts(chefArea?.slug || '')

    const products = chefAreaProducts?.result || []

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
                <AddProductInChefAreaSheet />
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
                <div className='text-lg font-bold'>
                    {t('chefArea.currentProduct')}
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                    {products.map((product) => (
                        <ChefAreaProductDetailItem key={product.slug} product={product} />
                    ))}
                </div>
            </div>
        </div>
    )
}
