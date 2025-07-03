import React from 'react'
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    Form,
    Button,
    PasswordInput,
} from '@/components/ui'
import { useResetPasswordSchema, TResetPasswordSchema } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { ButtonLoading } from '@/components/app/loading'

import { ROUTE } from '@/constants'
import { useResetPasswordForForgotPassword } from '@/hooks'

import { showToast } from '@/utils'

export const ResetPasswordForForgotPasswordForm: React.FC = () => {
    const { t } = useTranslation(['auth'])
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token') // Lấy giá trị token từ query string
    const { mutate: resetPassword, isPending } = useResetPasswordForForgotPassword()
    const form = useForm<TResetPasswordSchema>({
        resolver: zodResolver(useResetPasswordSchema()),
        defaultValues: {
            newPassword: '',
            confirmPassword: '',
            token: token || '',
        }
    })

    const handleSubmit = (value: TResetPasswordSchema) => {
        resetPassword(value, {
            onSuccess: () => {
                showToast(t('toast.resetPasswordSuccess'))
                navigate(ROUTE.LOGIN)
            },
        })
    }

    const formFields = {
        newPassword: (
            <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('forgotPassword.newPassword')}</FormLabel>
                        <FormControl>
                            <PasswordInput placeholder={t('forgotPassword.enterNewPassword')} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        ),
        confirmPassword: (
            <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('forgotPassword.confirmNewPassword')}</FormLabel>
                        <FormControl>
                            <PasswordInput placeholder={t('forgotPassword.enterConfirmNewPassword')} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        ),
    }

    return (
        <div className="mt-3">
            <Form {...form}>
                <form
                    className="space-y-6"
                    onSubmit={form.handleSubmit(handleSubmit)}
                >
                    <div className="grid grid-cols-1 md:w-[24rem] text-white gap-2">
                        {Object.keys(formFields).map((key) => (
                            <React.Fragment key={key}>
                                {formFields[key as keyof typeof formFields]}
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="flex items-center justify-between w-full">
                        <NavLink to={ROUTE.LOGIN} className="text-sm text-center text-primary">
                            {t('forgotPassword.back')}
                        </NavLink>
                        <Button
                            type="submit"
                            className="flex items-center justify-center"
                            disabled={isPending}
                        >
                            {isPending ? <ButtonLoading /> : t('forgotPassword.reset')}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
