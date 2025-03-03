import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import Lottie from "lottie-react";
import { Loader2, XCircle } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Card, CardContent } from "@/components/ui"
import { useConfirmEmailVerification } from "@/hooks"
import { IConfirmEmailVerificationRequest } from "@/types"
import VerifyEmailSuccessfully from "@/assets/images/verify-email-successfully.json"
import { useCurrentUrlStore } from "@/stores";
import { SendVerifyEmailDialog } from "@/components/app/dialog";


export default function EmailVerificationPage() {
    const { t } = useTranslation(['profile'])
    const [searchParams] = useSearchParams()
    const { currentUrl } = useCurrentUrlStore()
    const [status, setStatus] = useState<'pending' | 'verified' | 'failed'>('pending')
    const { mutate: confirmEmailVerification } = useConfirmEmailVerification()

    const token = searchParams.get('token')
    const email = searchParams.get('email')

    useEffect(() => {
        if (!token || !email) {
            setStatus("failed");
            return;
        }

        const confirmEmailVerificationParams: IConfirmEmailVerificationRequest = { token, email }

        const interval = setInterval(() => {
            confirmEmailVerification(confirmEmailVerificationParams, {
                onSuccess: () => {
                    setStatus("verified");
                    clearInterval(interval);
                },
                onError: () => {
                    setStatus("failed");
                    clearInterval(interval);
                }
            })
        }, 3000);

        return () => clearInterval(interval);
    }, [token, email, confirmEmailVerification]);

    useEffect(() => {
        if (status === "verified") {
            const timeout = setTimeout(() => {
                window.location.replace(currentUrl || "/");
            }, 5000);
            return () => clearTimeout(timeout);
        }
    }, [status, currentUrl]);


    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <Card className="p-6 text-center shadow-lg w-[36rem] rounded-2xl bg-white">
                <CardContent className="flex flex-col items-center space-y-6">
                    {status === "pending" && (
                        <>
                            <Loader2 className="text-blue-500 animate-spin" size={56} />
                            <p className="mt-4 text-lg text-gray-500 animate-fade-in">
                                {t("profile.verifyingEmail")}
                            </p>
                        </>
                    )}
                    {status === "verified" && (
                        <>
                            <div className="flex items-center justify-center w-64 h-64">
                                <Lottie animationData={VerifyEmailSuccessfully} loop={true} />
                            </div>
                            <p className="text-lg font-medium text-green-600 animate-fade-in">
                                {t("profile.verifyEmailSuccessfully")}
                            </p>
                            <p className="text-sm text-gray-500 animate-fade-in">
                                {t("profile.redirectingIn5s")}
                            </p>
                        </>
                    )}
                    {status === "failed" && (
                        <>
                            <XCircle className="text-red-500" size={56} />
                            <p className="mt-4 text-lg font-medium text-red-600 animate-fade-in">
                                {t("profile.verifyEmailFailed")}
                            </p>
                            <SendVerifyEmailDialog />
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
