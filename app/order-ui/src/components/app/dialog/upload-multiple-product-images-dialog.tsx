import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Upload } from "lucide-react";
import { PlusCircledIcon } from "@radix-ui/react-icons";

import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui";

import { useUploadMultipleProductImages } from "@/hooks";
import { IProduct } from "@/types";
import { showToast } from "@/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

interface IUploadMultipleProductImagesDialogProps {
    product: IProduct;
}

const MAX_FILE_SIZE_MB = 5; // Giới hạn dung lượng file (MB)

export default function UploadMultipleProductImagesDialog({ product }: IUploadMultipleProductImagesDialogProps) {
    const queryClient = useQueryClient()
    const { t } = useTranslation(["product"]);
    const { t: tToast } = useTranslation(["toast"]);
    const { t: tCommon } = useTranslation(["common"]);
    const { slug } = useParams();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { mutate: uploadMultipleProductImages } = useUploadMultipleProductImages();

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleFilesChange = (files: FileList | null) => {
        if (!files) return;

        const newFiles: File[] = [];
        const newPreviews: string[] = [];
        const exceededFiles: string[] = [];

        Array.from(files).forEach((file) => {
            const fileSizeMB = file.size / (1024 * 1024); // Chuyển kích thước sang MB
            if (fileSizeMB > MAX_FILE_SIZE_MB) {
                exceededFiles.push(file.name);
            } else {
                newFiles.push(file);
                newPreviews.push(URL.createObjectURL(file));
            }
        });

        if (exceededFiles.length > 0) {
            showToast(t("product.fileTooLarge", { fileNames: exceededFiles.join(", "), maxSize: MAX_FILE_SIZE_MB }));
        }

        setSelectedFiles((prev) => [...prev, ...newFiles]);
        setPreviewImages((prev) => [...prev, ...newPreviews]);
    };

    const handleConfirmUpload = () => {
        if (selectedFiles.length === 0) return;

        uploadMultipleProductImages(
            { slug: product.slug, files: selectedFiles },
            {
                onSuccess: () => {
                    showToast(tToast("toast.uploadImageSuccess"));
                    queryClient.invalidateQueries({
                        queryKey: ['product', slug]
                    })
                    setIsOpen(false);
                    setSelectedFiles([]);
                    setPreviewImages([]);
                },
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild className="flex justify-start w-fit">
                <Button variant="outline" className="gap-1 px-2 text-sm" onClick={() => setIsOpen(true)}>
                    <Upload className="icon" />
                    {t("product.uploadImage")}
                </Button>
            </DialogTrigger>
            <DialogContent className="rounded-md max-w-[20rem] sm:max-w-[36rem]">
                <DialogHeader>
                    <DialogTitle>{t("product.uploadImage")}</DialogTitle>
                    <DialogDescription>{t("product.uploadImageDescription")}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div
                        className="flex flex-wrap items-center justify-center w-full h-auto text-muted-foreground transition-colors border rounded-md cursor-pointer hover:border-primary hover:bg-foreground/10"
                        onClick={triggerFileInput}
                    >
                        {previewImages.length > 0 ? (
                            previewImages.map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={`Preview ${index + 1}`}
                                    className="object-cover w-24 h-24 m-2 rounded-lg"
                                />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center w-full h-40">
                                <PlusCircledIcon className="w-12 h-12 mb-2" />
                                <span>{t("product.addImage")}</span>
                            </div>
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        name="file"
                        multiple
                        onChange={(e) => handleFilesChange(e.target.files)}
                        className="hidden"
                    />
                    <div className="flex justify-end space-x-2">
                        <Button variant="secondary" onClick={() => setIsOpen(false)}>
                            {tCommon("common.cancel")}
                        </Button>
                        <Button onClick={handleConfirmUpload} disabled={selectedFiles.length === 0}>
                            {t("product.upload")}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
