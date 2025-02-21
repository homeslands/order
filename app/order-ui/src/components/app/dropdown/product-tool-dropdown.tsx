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
import { CreateProductDialog, ExportAllProductsTemplateDialog, ExportProductImportTemplateDialog, ImportProductByTemplateDialog } from "../dialog"
import { FileDown, FileUp } from "lucide-react"

export default function ProductToolDropdown() {
    const { t } = useTranslation('product')
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [importDialogOpen, setImportDialogOpen] = useState(false)
    const [exportAllDialogOpen, setExportAllDialogOpen] = useState(false)
    const [exportTemplateDialogOpen, setExportTemplateDialogOpen] = useState(false)

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    {t('product.chooseTool')}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-64">
                <DropdownMenuLabel>
                    {t('product.tool')}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem onSelect={() => setCreateDialogOpen(true)}>
                        <div className="flex items-center gap-1">
                            <PlusCircledIcon className="icon" />
                            {t('product.create')}
                        </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setImportDialogOpen(true)}>
                        <div className="flex items-center gap-1">
                            <FileUp className="icon" />
                            {t('product.importProducts')}
                        </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setExportAllDialogOpen(true)}>
                        <div className="flex items-center gap-1">
                            <FileDown className="icon" />
                            {t('product.exportAllProducts')}
                        </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setExportTemplateDialogOpen(true)}>
                        <div className="flex items-center gap-1">
                            <FileDown className="icon" />
                            {t('product.exportProductImportTemplate')}
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>

            <CreateProductDialog
                isOpen={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
            />
            <ImportProductByTemplateDialog
                isOpen={importDialogOpen}
                onOpenChange={setImportDialogOpen}
            />
            <ExportAllProductsTemplateDialog
                isOpen={exportAllDialogOpen}
                onOpenChange={setExportAllDialogOpen}
            />
            <ExportProductImportTemplateDialog
                isOpen={exportTemplateDialogOpen}
                onOpenChange={setExportTemplateDialogOpen}
            />
        </DropdownMenu>
    )
}
