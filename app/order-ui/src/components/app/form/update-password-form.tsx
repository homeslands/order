import React from 'react'
import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
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
import { useUpdatePasswordSchema, TUpdatePasswordSchema } from '@/schemas'

import { zodResolver } from '@hookform/resolvers/zod'
import { IUpdatePasswordRequest } from '@/types'
import { useUpdatePassword } from '@/hooks'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'
import { PasswordWithRulesInput } from '../input'

interface IFormUpdatePasswordProps {
    onSubmit: (isOpen: boolean) => void
}

export const UpdatePasswordForm: React.FC<IFormUpdatePasswordProps> = ({
    onSubmit,
}) => {
    const queryClient = useQueryClient()
    const { t } = useTranslation(['profile'])
    const { mutate: updatePassword } = useUpdatePassword()
    const form = useForm<TUpdatePasswordSchema>({
        resolver: zodResolver(useUpdatePasswordSchema()),
        defaultValues: {
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    })

    const handleSubmit = (data: IUpdatePasswordRequest) => {
        updatePassword(data, {
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: [QUERYKEY.profile],
                })
                onSubmit(false)
                form.reset()
                showToast(t('toast.updatePasswordSuccess'))
            },
        })
    }

    const formFields = {
        oldPassword: (
            <FormField
                control={form.control}
                name="oldPassword"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('profile.oldPassword')}</FormLabel>
                        <FormControl>
                            <PasswordInput placeholder={t('profile.enterOldPassword')} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        ),
        newPassword: (
            <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('profile.newPassword')}</FormLabel>
                        <FormControl>
                            <PasswordWithRulesInput
                                value={field.value}
                                onChange={field.onChange}
                                placeholder={t('profile.enterNewPassword')}
                                disabled={field.disabled}
                            />
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
                        <FormLabel>{t('profile.confirmPassword')}</FormLabel>
                        <FormControl>
                            <PasswordInput placeholder={t('profile.enterConfirmPassword')} {...field} />
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
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 gap-2">
                        {Object.keys(formFields).map((key) => (
                            <React.Fragment key={key}>
                                {formFields[key as keyof typeof formFields]}
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={
                                !form.watch('oldPassword') ||
                                !form.watch('newPassword') ||
                                !form.watch('confirmPassword') ||
                                form.formState.isSubmitting
                            }
                        >
                            {t('profile.update')}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
