import React from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'

import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    Form,
    Button,
    PasswordForResetInput,
} from '@/components/ui'
import { useResetPasswordSchema, TResetPasswordSchema } from '@/schemas'
import { PasswordWithRulesForResetInput } from '../input'

interface ResetPasswordFormProps {
    onSubmit: (data: TResetPasswordSchema) => void
    isLoading?: boolean
    token: string
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
    onSubmit,
    isLoading = false,
    token,
}) => {
    const { t } = useTranslation('auth')
    const form = useForm<TResetPasswordSchema>({
        resolver: zodResolver(useResetPasswordSchema()),
        defaultValues: {
            newPassword: '',
            confirmPassword: '',
            token: token,
        },
    })

    const handleSubmit = (values: TResetPasswordSchema) => {
        onSubmit(values)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-white">
                                {t('forgotPassword.newPassword')}
                            </FormLabel>
                            <FormControl>
                                <PasswordWithRulesForResetInput
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder={t('forgotPassword.enterNewPassword')}
                                    disabled={field.disabled || isLoading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-white">
                                {t('forgotPassword.confirmNewPassword')}
                            </FormLabel>
                            <FormControl>
                                <PasswordForResetInput
                                    placeholder={t('forgotPassword.enterConfirmNewPassword')}
                                    {...field}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {t('forgotPassword.reset')}
                </Button>
            </form>
        </Form>
    )
}

