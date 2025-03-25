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
import { useCreateRole } from '@/hooks'
import { createRoleSchema, TCreateRoleSchema } from '@/schemas'

import { zodResolver } from '@hookform/resolvers/zod'
import { ICreateRoleRequest } from '@/types'
import { showToast } from '@/utils'
import { QUERYKEY } from '@/constants'

interface IFormCreateRoleProps {
    onSubmit: (isOpen: boolean) => void
}

export const CreateRoleForm: React.FC<IFormCreateRoleProps> = ({
    onSubmit,
}) => {
    const queryClient = useQueryClient()
    const { t } = useTranslation(['role'])
    const { mutate: createRole } = useCreateRole()

    const form = useForm<TCreateRoleSchema>({
        resolver: zodResolver(createRoleSchema),
        defaultValues: {
            name: '',
            description: '',
        },
    })

    const handleSubmit = (data: ICreateRoleRequest) => {
        createRole(data, {
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: [QUERYKEY.roles],
                })
                onSubmit(false)
                form.reset()
                showToast(t('toast.createRoleSuccess'))
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
                            {t('role.create')}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
