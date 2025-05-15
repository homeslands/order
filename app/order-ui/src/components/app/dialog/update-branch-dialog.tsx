import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SquarePen } from 'lucide-react'

import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui'

import { UpdateBranchForm } from '@/components/app/form'
import { IBranch } from '@/types'

interface IUpdateBranchDialogProps {
    branch: IBranch
}

export default function UpdateBranchDialog({ branch }: IUpdateBranchDialogProps) {
    const { t } = useTranslation(['branch'])
    const [isOpen, setIsOpen] = useState(false)
    const handleSubmit = (isOpen: boolean) => {
        setIsOpen(isOpen)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild className="flex justify-start">
                <Button
                    variant="ghost"
                    className="h-10 gap-1 px-2 text-sm"
                    onClick={() => setIsOpen(true)}
                >
                    <SquarePen className="icon" />
                    {t('branch.update')}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[20rem] rounded-md px-6 sm:max-w-[36rem]">
                <DialogHeader>
                    <DialogTitle>{t('branch.update')}</DialogTitle>
                    <DialogDescription>
                        {t('branch.updateBranchDescription')}
                    </DialogDescription>
                </DialogHeader>
                <UpdateBranchForm branch={branch} onSubmit={handleSubmit} />
            </DialogContent>
        </Dialog>
    )
}
