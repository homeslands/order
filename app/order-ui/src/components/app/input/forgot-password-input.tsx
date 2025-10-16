import { useTranslation } from "react-i18next"
import { Label, PasswordInput } from "@/components/ui"

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

    return (
        <div className="flex flex-col gap-4">
            <div className="space-y-2">
                <Label className="text-white">{t("forgotPassword.newPassword")}</Label>
                <PasswordInput
                    placeholder={t("forgotPassword.enterNewPassword")}
                    value={newPassword}
                    onChange={(e) => onChangeNewPassword(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label className="text-white">{t("forgotPassword.confirmNewPassword")}</Label>
                <PasswordInput
                    placeholder={t("forgotPassword.enterConfirmNewPassword")}
                    value={confirmPassword}
                    onChange={(e) => onChangeConfirmPassword(e.target.value)}
                />
            </div>
        </div>
    )
}
