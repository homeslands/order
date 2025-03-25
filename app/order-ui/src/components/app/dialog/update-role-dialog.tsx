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

import { UpdateRoleForm } from '@/components/app/form'
import { IRole } from '@/types'

interface IUpdateRoleDialogProps {
    role: IRole | null
}

export default function UpdateRoleDialog({ role }: IUpdateRoleDialogProps) {
    const { t } = useTranslation(['role'])
    const [isOpen, setIsOpen] = useState(false)
    const handleSubmit = (isOpen: boolean) => {
        setIsOpen(isOpen)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild className="flex justify-start">
                <Button
                    variant="ghost"
                    className="h-10 w-full gap-1 px-2 text-sm"
                    onClick={() => setIsOpen(true)}
                >
                    <SquarePen className="icon" />
                    {t('role.update')}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[20rem] rounded-md px-6 sm:max-w-[36rem]">
                <DialogHeader>
                    <DialogTitle>{t('role.update')}</DialogTitle>
                    <DialogDescription>
                        {t('role.updateRoleDescription')}
                    </DialogDescription>
                </DialogHeader>
                <UpdateRoleForm role={role ? role : null} onSubmit={handleSubmit} />
            </DialogContent>
        </Dialog>
    )
}
