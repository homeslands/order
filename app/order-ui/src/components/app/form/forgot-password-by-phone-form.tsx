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
import { TForgotPasswordByPhoneSchema, useForgotPasswordByPhoneSchema } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { ButtonLoading } from '@/components/app/loading'

import { ROUTE } from '@/constants'


export const ForgotPasswordByPhoneForm: React.FC<{ onSubmit: (value: TForgotPasswordByPhoneSchema) => void }> = ({ onSubmit }) => {
    const { t } = useTranslation(['auth'])
    const form = useForm<TForgotPasswordByPhoneSchema>({
        resolver: zodResolver(useForgotPasswordByPhoneSchema()),
        defaultValues: {
            phoneNumber: '',
        }
    })

    const handleSubmit = (value: TForgotPasswordByPhoneSchema) => {
        onSubmit(value)
    }

    const formFields = {
        phoneNumber: (
            <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('forgotPassword.phoneNumber')}</FormLabel>
                        <FormControl>
                            <Input
                                placeholder={t('forgotPassword.enterPhoneNumber')}
                                {...field}
                                onChange={(e) => {
                                    // Chỉ giữ lại các ký tự là số
                                    const onlyNumbers = e.target.value.replace(/\D/g, '')
                                    field.onChange(onlyNumbers) // Gán lại cho field dạng string
                                }}
                                inputMode="numeric" // Gợi ý bàn phím số trên mobile
                                pattern="[0-9]*"     // Gợi ý trình duyệt chỉ cho nhập số
                                maxLength={10}       // Giới hạn tối đa 10 số
                            />
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
                    <div className="flex justify-between items-center w-full">
                        <NavLink to={ROUTE.FORGOT_PASSWORD} className="text-sm text-center text-primary">
                            {t('forgotPassword.back')}
                        </NavLink>
                        <Button
                            type="submit"
                            className="flex justify-center items-center"
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
