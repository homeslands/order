import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Trash2, TriangleAlert } from 'lucide-react'

import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Label,
} from '@/components/ui'
import { IOrderItem } from '@/types'
import { useDeleteOrderItem } from '@/hooks'
import { showToast } from '@/utils'
import { ROUTE } from '@/constants'

interface DeleteLastOrderItemDialogProps {
    orderItem: IOrderItem
    onSuccess?: () => void
}

export default function DeleteLastOrderItemDialog({
    orderItem,
    onSuccess
}: DeleteLastOrderItemDialogProps) {
    const { t } = useTranslation('menu')
    const { t: tCommon } = useTranslation('common')
    const { t: tToast } = useTranslation('toast')
    const [isOpen, setIsOpen] = useState(false)
    const navigate = useNavigate()
    const { mutate: deleteOrderItem, isPending } = useDeleteOrderItem()

    const handleDelete = () => {
        deleteOrderItem(orderItem.slug, {
            onSuccess: () => {
                showToast(tToast('toast.deleteOrderItemSuccess'))
                setIsOpen(false)
                onSuccess?.()

                // Navigate về menu page sau khi xóa món cuối cùng
                setTimeout(() => {
                    navigate(ROUTE.STAFF_MENU)
                }, 1000) // Delay 1s để user thấy toast
            },
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-destructive/10 hover:text-destructive"
                    title={t('common.remove')}
                >
                    <Trash2 size={18} className='icon text-destructive' />
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[32rem]">
                <DialogHeader>
                    <DialogTitle className="flex gap-2 items-center pb-4 border-b text-destructive border-destructive">
                        <TriangleAlert className="w-6 h-6" />
                        {t('order.deleteLastItem')}
                    </DialogTitle>
                    <DialogDescription className={`p-2 bg-red-100 rounded-md dark:bg-gray-800 text-destructive`}>
                        {tCommon('common.deleteNote')}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <Label htmlFor="name" className="text-sm leading-5 text-left text-muted-foreground">
                        {t('order.deleteLastItemWarning1')} <strong className="text-foreground">{orderItem.name}</strong>{' '}
                        {t('order.deleteLastItemWarning2')}
                        <br />
                        <br />
                        <span className="font-semibold text-destructive">
                            {t('order.deleteLastItemWarning3')}
                        </span>
                    </Label>
                </div>

                <DialogFooter className="flex flex-row gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                        {tCommon('common.cancel')}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>{tCommon('common.processing')}</>
                        ) : (
                            <>{t('order.cancelOrder')}</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
