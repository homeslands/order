import React from 'react'
import { NavLink } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    Input,
    Form,
    Button,
} from '@/components/ui'
import { useForgotPasswordSchema, TForgotPasswordSchema } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { ButtonLoading } from '@/components/app/loading'

import { ROUTE } from '@/constants'
import { useForgotPassword } from '@/hooks'

import { showToast } from '@/utils'

export const ForgotPasswordForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
    const { t } = useTranslation(['auth'])
    const { mutate: forgotPassword, isPending } = useForgotPassword()
    const form = useForm<TForgotPasswordSchema>({
        resolver: zodResolver(useForgotPasswordSchema()),
        defaultValues: {
            email: '',
        }
    })

    const handleSubmit = (value: TForgotPasswordSchema) => {
        forgotPassword(value, {
            onSuccess: () => {
                onSuccess()
                showToast(t('toast.forgotPasswordSuccess'))
            },
        })
    }

    const formFields = {
        email: (
            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('forgotPassword.email')}</FormLabel>
                        <FormControl>
                            <Input placeholder={t('forgotPassword.enterEmail')} {...field} />
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
                            {isPending ? <ButtonLoading /> : t('forgotPassword.send')}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
