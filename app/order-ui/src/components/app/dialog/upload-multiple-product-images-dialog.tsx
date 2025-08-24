import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Upload, X } from "lucide-react";

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
import { QUERYKEY } from "@/constants";

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
    const { mutate: uploadMultipleProductImages, isPending } = useUploadMultipleProductImages();

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
                        queryKey: [QUERYKEY.specificProduct, slug],
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
                    <div className="space-y-4">
                        {/* Upload Zone */}
                        <div
                            className="flex flex-col justify-center items-center p-4 w-full h-32 rounded-md border-2 border-dashed cursor-pointer hover:border-primary hover:bg-foreground/5"
                            onClick={triggerFileInput}
                        >
                            <Upload className="mb-2 w-10 h-10 text-primary" />
                            <p className="text-sm font-medium">{t("product.clickToUploadImage")}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {`${t("product.maxFileSize")} ${MAX_FILE_SIZE_MB}MB ${t("product.multipleImagesAllowed")}`}
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleFilesChange(e.target.files)}
                                className="hidden"
                            />
                        </div>

                        {/* Preview Zone */}
                        <div className="min-h-[6rem] max-h-60 overflow-y-auto border rounded-md p-2">
                            {previewImages.length > 0 ? (
                                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                                    {previewImages.map((image, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={image}
                                                alt={`Preview ${index + 1}`}
                                                className="object-cover w-24 h-24 rounded-lg border"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="absolute -top-1 right-2 w-8 h-8 text-white rounded-full opacity-0 bg-destructive group-hover:opacity-100 hover:bg-destructive/80 hover:text-white"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
                                                    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
                                                }}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-center text-muted-foreground">
                                    {t("product.noImagesYet")}
                                </p>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-end space-x-2">
                            <Button variant="secondary" onClick={() => setIsOpen(false)}>
                                {tCommon("common.cancel")}
                            </Button>
                            <Button onClick={handleConfirmUpload} disabled={selectedFiles.length === 0 || isPending}>
                                {isPending ? <span className="flex gap-2 items-center">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {t("product.upload")}
                                </span> : t("product.upload")}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
