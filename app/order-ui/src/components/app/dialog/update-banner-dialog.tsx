import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui'

import { UpdateBannerForm } from '@/components/app/form'
import { SquareMousePointer } from 'lucide-react'
import { IBanner } from '@/types'

export default function UpdateBannerDialog({ banner }: { banner: IBanner }) {
    const { t } = useTranslation(['banner'])
    const [isOpen, setIsOpen] = useState(false)

    const handleSubmit = (isOpen: boolean) => {
        setIsOpen(isOpen)
    }
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" className="flex justify-start gap-1 px-2">
                    <SquareMousePointer className='icon' />
                    {t('banner.viewAndEdit')}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[20rem] rounded-md px-6 sm:max-w-[36rem]">
                <DialogHeader>
                    <DialogTitle>{t('banner.update')}</DialogTitle>
                    <DialogDescription>
                        {t('banner.updateDescription')}
                    </DialogDescription>
                </DialogHeader>
                <UpdateBannerForm banner={banner} onSubmit={handleSubmit} />
            </DialogContent>
        </Dialog>
    )
}
