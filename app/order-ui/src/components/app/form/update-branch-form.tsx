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
import { updateBranchSchema, TUpdateBranchSchema } from '@/schemas'

import { zodResolver } from '@hookform/resolvers/zod'
import { IBranch, IUpdateBranchRequest } from '@/types'
import { useUpdateBranch } from '@/hooks'
import { showToast } from '@/utils'

interface IFormUpdateBranchProps {
    branch: IBranch
    onSubmit: (isOpen: boolean) => void
}

export const UpdateBranchForm: React.FC<IFormUpdateBranchProps> = ({
    branch,
    onSubmit,
}) => {
    const queryClient = useQueryClient()
    const { t } = useTranslation(['branch'])
    const { mutate: updateBranch } = useUpdateBranch()

    const form = useForm<TUpdateBranchSchema>({
        resolver: zodResolver(updateBranchSchema),
        defaultValues: {
            slug: branch.slug,
            name: branch.name,
            address: branch.address,
        },
    })

    const handleSubmit = (data: IUpdateBranchRequest) => {
        updateBranch(data, {
            onSuccess: () => {
                queryClient.invalidateQueries({
                    // queryKey: ['menus', { branchSlug: userInfo?.branch.slug }],
                    queryKey: ['branches'],
                })
                onSubmit(false)
                form.reset()
                showToast(t('toast.updateBranchSuccess'))
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
                        <FormLabel>{t('branch.branchName')}</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder={t('branch.enterBranchName')} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        ),
        address: (
            <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('branch.branchAddress')}</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder={t('branch.enterBranchAddress')} />
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
                            {t('branch.update')}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
