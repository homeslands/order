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
    Input,
} from '@/components/ui'
import { TUpdateRoleSchema, updateRoleSchema } from '@/schemas'

import { zodResolver } from '@hookform/resolvers/zod'
import { IRole, IUpdateRoleRequest } from '@/types'
import { useUpdateRole } from '@/hooks'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'

interface IFormUpdateRoleProps {
    role: IRole | null
    onSubmit: (isOpen: boolean) => void
}

export const UpdateRoleForm: React.FC<IFormUpdateRoleProps> = ({
    role,
    onSubmit,
}) => {
    const queryClient = useQueryClient()
    const { t } = useTranslation(['role'])
    const { mutate: updateRole } = useUpdateRole()

    const form = useForm<TUpdateRoleSchema>({
        resolver: zodResolver(updateRoleSchema),
        defaultValues: {
            slug: role?.slug || '',
            name: role?.name || '',
            description: role?.description || '',
        },
    })

    const handleSubmit = (data: IUpdateRoleRequest) => {
        updateRole(data, {
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: [QUERYKEY.roles],
                })
                onSubmit(false)
                form.reset()
                showToast(t('toast.updateRoleSuccess'))
            },
        })
    }

    const formFields = {
        name: (
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('role.name')}</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder={t('role.enterName')} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        ),
        description: (
            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('role.description')}</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder={t('role.enterDescription')} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        )
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
                            {t('role.update')}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
