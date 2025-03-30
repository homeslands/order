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
import { useCreateChefArea } from '@/hooks'
import { createChefAreaSchema, TCreateChefAreaSchema } from '@/schemas'

import { zodResolver } from '@hookform/resolvers/zod'
import { ICreateChefAreaRequest } from '@/types'
import { showToast } from '@/utils'
import { useUserStore } from '@/stores'
import { QUERYKEY } from '@/constants'
import { BranchSelect } from '../select'

interface IFormCreateChefAreaProps {
    onSubmit: (isOpen: boolean) => void
}

export const CreateChefAreaForm: React.FC<IFormCreateChefAreaProps> = ({
    onSubmit,
}) => {
    const queryClient = useQueryClient()
    const { t } = useTranslation(['chefArea'])
    const { userInfo } = useUserStore()
    const { mutate: createChefArea } = useCreateChefArea()

    const form = useForm<TCreateChefAreaSchema>({
        resolver: zodResolver(createChefAreaSchema),
        defaultValues: {
            branch: userInfo?.branch?.slug || '',
            name: '',
            description: '',
        },
    })

    const handleSubmit = (data: ICreateChefAreaRequest) => {
        createChefArea(data, {
            onSuccess: () => {
                // Ensure this matches exactly with useGetAreas query key
                queryClient.invalidateQueries({
                    queryKey: [QUERYKEY.chefAreas],
                    exact: false,
                    refetchType: 'all'
                })
                onSubmit(false)
                form.reset()
                showToast(t('toast.createChefAreaSuccess'))
            }
        })
    }

    const formFields = {
        branch: (
            <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('chefArea.branch')}</FormLabel>
                        <FormControl>
                            <BranchSelect {...field} />
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
                        <FormLabel>{t('chefArea.name')}</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder={t('chefArea.enterName')} />
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
                        <FormLabel>{t('chefArea.description')}</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder={t('chefArea.enterDescription')} />
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
                            {t('chefArea.create')}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
