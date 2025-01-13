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
    Input,
    Form,
    Button,
} from '@/components/ui'
import {
    userRoleSchema,
    TUserRoleSchema,
} from '@/schemas'

import { zodResolver } from '@hookform/resolvers/zod'
import { IUpdateUserRoleRequest, IUserInfo } from '@/types'
import { useUpdateUserRole } from '@/hooks'
import { showToast } from '@/utils'
import { RoleSelect } from '@/components/app/select'

interface IFormUpdateUserRoleProps {
    user: IUserInfo
    onSubmit: (isOpen: boolean) => void
}

export const UpdateUserRoleForm: React.FC<
    IFormUpdateUserRoleProps
> = ({ user, onSubmit }) => {
    const queryClient = useQueryClient()
    const { t } = useTranslation(['user'])
    const { mutate: updateUserRole } = useUpdateUserRole()
    const form = useForm<TUserRoleSchema>({
        resolver: zodResolver(userRoleSchema),
        defaultValues: {
            slug: user.slug,
            name: user.firstName + ' ' + user.lastName,
            role: ''
        },
    })

    const handleSubmit = (data: IUpdateUserRoleRequest) => {
        updateUserRole(data, {
            onSuccess: () => {
                // Invalidate queries with proper type
                queryClient.invalidateQueries({
                    queryKey: ['customers']
                })
                queryClient.invalidateQueries({
                    queryKey: ['user', user.slug]
                })
                onSubmit(false)
                form.reset()
                showToast(t('toast.updateUserRoleSuccess'))
            },
        })
    }

    const formFields = {
        slug: (
            <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('users.name')}</FormLabel>
                        <FormControl>
                            <Input
                                readOnly
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        ),
        name: (
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('users.name')}</FormLabel>
                        <FormControl>
                            <Input
                                readOnly
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        ),
        role: (
            <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('users.role')}</FormLabel>
                        <FormControl>
                            <RoleSelect defaultValue={user.role.slug} {...field} />
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
                        <Button className="flex justify-end" type="submit">
                            {t('users.update')}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
