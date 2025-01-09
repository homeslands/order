"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export default function NestedDialogs() {
    const [mainDialogOpen, setMainDialogOpen] = React.useState(false)
    const [nestedDialogOpen, setNestedDialogOpen] = React.useState(false)

    return (
        <Dialog open={mainDialogOpen} onOpenChange={setMainDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Open Main Dialog</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Main Dialog</DialogTitle>
                    <DialogDescription>
                        This is the main dialog. You can open a nested dialog from here.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2">
                    <div className="grid flex-1 gap-2">
                        <p className="text-sm text-muted-foreground">
                            Click the button below to open a nested dialog.
                        </p>
                    </div>
                </div>
                <Dialog open={nestedDialogOpen} onOpenChange={setNestedDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="mt-4">Open Nested Dialog</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[375px]">
                        <DialogHeader>
                            <DialogTitle>Nested Dialog</DialogTitle>
                            <DialogDescription>
                                This is a nested dialog. The main dialog is still open.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center space-x-2">
                            <div className="grid flex-1 gap-2">
                                <p className="text-sm text-muted-foreground">
                                    You can close this dialog independently of the main dialog.
                                </p>
                            </div>
                        </div>
                        <Button className="mt-4" onClick={() => setNestedDialogOpen(false)}>
                            Close Nested Dialog
                        </Button>
                    </DialogContent>
                </Dialog>
            </DialogContent>
        </Dialog>
    )
}

