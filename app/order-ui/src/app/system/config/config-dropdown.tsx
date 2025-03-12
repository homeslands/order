import React from "react";
import {
    MoreHorizontal,
    PenSquare,
    Trash,
} from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Button
} from "@/components/ui"
import { DeleteSystemConfigDialog, UpdateSystemConfigDialog } from "@/components/app/dialog"
import { ISystemConfig } from "@/types"
import { useTranslation } from "react-i18next";

export default function ConfigDropdown({ systemConfig }: { systemConfig: ISystemConfig }) {
    const { t } = useTranslation('config');
    const { t: tCommon } = useTranslation('common');
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                    <MoreHorizontal />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>
                    {tCommon('common.action')}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem
                        onSelect={(e) => {
                            e.preventDefault(); // Ngăn dropdown bị đóng
                            setIsDialogOpen(true); // Mở dialog
                        }}
                    >
                        <PenSquare className="mr-2 icon" />
                        <span>
                            {t('config.update')}
                        </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onSelect={(e) => {
                            e.preventDefault(); // Ngăn dropdown bị đóng
                            setIsDeleteDialogOpen(true); // Mở dialog
                        }}>
                        <Trash className="mr-2 icon" />
                        <span>
                            {t('config.delete')}
                        </span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
            {isDialogOpen && (
                <UpdateSystemConfigDialog
                    systemConfig={systemConfig}
                    onClose={() => setIsDialogOpen(false)} // Đóng dialog khi cần
                />
            )}
            {isDeleteDialogOpen && (
                <DeleteSystemConfigDialog
                    systemConfig={systemConfig}
                    onClose={() => setIsDeleteDialogOpen(false)} // Đóng dialog khi cần
                />
            )}
        </DropdownMenu>
    );
}
