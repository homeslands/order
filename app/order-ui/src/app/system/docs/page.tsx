import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'

export default function DocsPage() {
    const { t } = useTranslation(['doc'])

    return (
        <div>
            <div className="sticky top-0 z-10 flex flex-col items-center gap-2 pb-4 pr-4">
                <div className="flex flex-col flex-1 w-full">
                    <span className="flex items-center gap-1 text-lg">
                        <SquareMenu />
                        {t('doc.title')}
                    </span>
                </div>
            </div>

            <div className="grid w-full grid-cols-4 gap-2">
                {[...Array(8)].map((_, index) => (
                    <div key={index} className='p-4 transition-all duration-200 border rounded-md hover:border-primary'>
                        Docs
                    </div>
                ))}
            </div>
        </div>
    )
}
