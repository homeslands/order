import {
    Button,
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui'
import { useTranslation } from 'react-i18next';

interface IConfirmLeavingRoleDetailPageDialogProps {
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
    onConfirm?: () => void
}

export default function ConfirmLeavingRoleDetailPageDialog({ isOpen, onOpenChange, onConfirm }: IConfirmLeavingRoleDetailPageDialogProps) {
    const { t } = useTranslation('role');
    const handleConfirm = () => {
        onOpenChange(false);
        onConfirm?.();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
            </DialogTrigger>

            <DialogContent className="max-w-[22rem] rounded-md px-6 sm:max-w-[32rem]">
                <DialogHeader>
                    <DialogTitle className="pb-4 border-b">
                        <div className="flex items-center gap-2 text-primary">
                            {t('role.confirmLeavingRoleDetailPage')}
                        </div>
                    </DialogTitle>

                    <div className="py-4 text-sm text-gray-500">
                        {t('role.confirmLeavingRoleDetailPageDescription')}
                        <br />
                    </div>
                </DialogHeader>
                <DialogFooter className="flex flex-row justify-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="border border-gray-300 min-w-24"
                    >
                        {t('role.confirmLeavingRoleDetailPageCancel')}
                    </Button>
                    <Button onClick={handleConfirm}>
                        {t('role.confirmLeavingRoleDetailPageConfirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

