import { Button } from "@/components/ui";
import { showToast } from "@/utils";
import { useTranslation } from "react-i18next";

interface IDownloadQrCodeProps {
    qrCode: string | null
    slug: string | null
}

export default function DownloadQrCode({ qrCode, slug }: IDownloadQrCodeProps) {
    const { t } = useTranslation(['menu'])
    const { t: tToast } = useTranslation(['toast'])
    const handleDownloadQR = () => {
        if (!qrCode) return;

        fetch(qrCode)
            .then((response) => response.blob())
            .then((blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `payment-qr-${slug}.png`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                showToast(tToast('toast.downloadQrSuccess'));
            })
            .catch(() => {
                showToast(tToast('toast.downloadQrError'));
            });
    };
    return (
        <Button
            disabled={!qrCode}
            className="w-fit"
            onClick={handleDownloadQR}
        >
            {t('paymentMethod.downloadQRCode')}
        </Button>
    )
}