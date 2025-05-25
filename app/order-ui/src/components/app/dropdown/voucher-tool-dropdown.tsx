import { useState } from "react"
import { useTranslation } from "react-i18next"
import { PlusCircledIcon } from '@radix-ui/react-icons'

import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui"
import { CreateMultipleVoucherSheet, CreateVoucherSheet } from "../sheet"

export default function VoucherToolDropdown({ onSuccess }: { onSuccess: () => void }) {
    const { t } = useTranslation('voucher')
    const [createSheetOpen, setCreateSheetOpen] = useState(false)
    const [createMultipleSheetOpen, setCreateMultipleSheetOpen] = useState(false)

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    {t('voucher.chooseTool')}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-64">
                <DropdownMenuLabel>
                    {t('voucher.tool')}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem onSelect={() => setCreateSheetOpen(true)}>
                        <div className="flex gap-1 items-center">
                            <PlusCircledIcon className="icon" />
                            {t('voucher.create')}
                        </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setCreateMultipleSheetOpen(true)}>
                        <div className="flex gap-1 items-center">
                            <PlusCircledIcon className="icon" />
                            {t('voucher.createMultiple')}
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>

            <CreateVoucherSheet
                isOpen={createSheetOpen}
                onSuccess={onSuccess}
                openChange={setCreateSheetOpen}
            />
            <CreateMultipleVoucherSheet
                isOpen={createMultipleSheetOpen}
                onSuccess={onSuccess}
                openChange={setCreateMultipleSheetOpen}
            />
        </DropdownMenu>
    )
}
