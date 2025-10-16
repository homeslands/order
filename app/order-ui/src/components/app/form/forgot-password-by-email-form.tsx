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
import { TForgotPasswordByEmailSchema, useForgotPasswordByEmailSchema } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { ButtonLoading } from '@/components/app/loading'

import { ROUTE } from '@/constants'


export const ForgotPasswordByEmailForm: React.FC<{ onSubmit: (value: TForgotPasswordByEmailSchema) => void }> = ({ onSubmit }) => {
    const { t } = useTranslation(['auth'])
    const form = useForm<TForgotPasswordByEmailSchema>({
        resolver: zodResolver(useForgotPasswordByEmailSchema()),
        defaultValues: {
            email: '',
        }
    })

    const handleSubmit = (value: TForgotPasswordByEmailSchema) => {
        onSubmit(value)
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
                        <NavLink to={ROUTE.FORGOT_PASSWORD} className="text-sm text-center text-primary">
                            {t('forgotPassword.backButton')}
                        </NavLink>
                        <Button
                            type="submit"
                            className="flex items-center justify-center"
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting ? <ButtonLoading /> : t('forgotPassword.send')}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

