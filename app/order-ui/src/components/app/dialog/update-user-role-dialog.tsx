import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UserCog } from 'lucide-react'

import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui'


import { UpdateUserRoleForm } from '@/components/app/form'
import { IUserInfo } from '@/types'

interface IUpdateUserRoleDialogProps {
    user: IUserInfo
}

export default function UpdateUserRoleDialog({
    user,
}: IUpdateUserRoleDialogProps) {
    const { t } = useTranslation(['user'])
    const [isOpen, setIsOpen] = useState(false)
    const handleSubmit = (isOpen: boolean) => {
        setIsOpen(isOpen)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild className="flex items-center justify-start w-full">
                <Button
                    variant="ghost"
                    className="gap-1 px-2 text-sm"
                    onClick={() => setIsOpen(true)}
                >
                    <UserCog className="icon" />
                    {t('users.updateRole')}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[20rem] rounded-md px-6 sm:max-w-[36rem]">
                <DialogHeader>
                    <DialogTitle>{t('users.updateRole')}</DialogTitle>
                    <DialogDescription>
                        {t('users.updateRoleDescription')}
                    </DialogDescription>
                </DialogHeader>
                <UpdateUserRoleForm
                    user={user}
                    onSubmit={handleSubmit}
                />
            </DialogContent>
        </Dialog>
    )
}
