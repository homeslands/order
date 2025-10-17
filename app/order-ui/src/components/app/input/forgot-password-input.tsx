import { useTranslation } from "react-i18next"
import { useEffect, useState } from "react"
import { Label } from "@/components/ui"
import PasswordWithRulesInput from "./password-with-rules-input"

interface ForgotPasswordInputProps {
    newPassword: string
    confirmPassword: string
    onChangeNewPassword: (value: string) => void
    onChangeConfirmPassword: (value: string) => void
}

export default function ForgotPasswordInput({
    newPassword,
    confirmPassword,
    onChangeNewPassword,
    onChangeConfirmPassword,
}: ForgotPasswordInputProps) {
    const { t } = useTranslation("auth")
    const [confirmTouched, setConfirmTouched] = useState(false)
    const [passwordsMatch, setPasswordsMatch] = useState(true)

    useEffect(() => {
        if (confirmTouched && confirmPassword.length > 0) {
            setPasswordsMatch(newPassword === confirmPassword)
        }
    }, [newPassword, confirmPassword, confirmTouched])

    return (
        <div className="flex flex-col gap-4">
            <div className="space-y-2">
                <Label className="text-white">{t("forgotPassword.newPassword")}</Label>
                <PasswordWithRulesInput
                    placeholder={t("forgotPassword.enterNewPassword")}
                    value={newPassword}
                    onChange={onChangeNewPassword}
                />
            </div>
            <div className="space-y-2">
                <Label className="text-white">{t("forgotPassword.confirmNewPassword")}</Label>
                <div className="space-y-1">
                    <PasswordWithRulesInput
                        placeholder={t("forgotPassword.enterConfirmNewPassword")}
                        value={confirmPassword}
                        onChange={(value) => {
                            onChangeConfirmPassword(value)
                            if (!confirmTouched && value.length > 0) {
                                setConfirmTouched(true)
                            }
                        }}
                    />
                    {confirmTouched && confirmPassword.length > 0 && !passwordsMatch && (
                        <p className="text-sm text-red-600">
                            {t("forgotPassword.passwordNotMatch")}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

