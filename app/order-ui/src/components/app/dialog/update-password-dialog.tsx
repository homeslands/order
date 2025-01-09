import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyRound } from 'lucide-react'

import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui'

import { UpdatePasswordForm } from '@/components/app/form'

export default function UpdatePasswordDialog() {
    const { t } = useTranslation(['profile'])
    const [isOpen, setIsOpen] = useState(false)
    const handleSubmit = (isOpen: boolean) => {
        setIsOpen(isOpen)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="h-10 gap-1 text-sm w-fit"
                    onClick={() => setIsOpen(true)}
                >
                    <KeyRound className="icon" />
                    <span className='hidden sm:block'>
                        {t('profile.updatePassword')}
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[20rem] rounded-md px-6 sm:max-w-[36rem]">
                <DialogHeader>
                    <DialogTitle>{t('profile.updatePassword')}</DialogTitle>
                    <DialogDescription>
                        {t('profile.updatePasswordDescription')}
                    </DialogDescription>
                </DialogHeader>
                <UpdatePasswordForm onSubmit={handleSubmit} />
            </DialogContent>
        </Dialog>
    )
}
