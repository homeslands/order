import React from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    Form,
    Input,
    Label,
    Switch,
    Button,
} from '@/components/ui'
import { bannerUpadateSchema, TBannerUpdateSchema } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { IBanner } from '@/types'
import { useUpdateBanner } from '@/hooks'
import { useQueryClient } from '@tanstack/react-query'
import { QUERYKEY } from '@/constants'
import { showToast } from '@/utils'

interface IFormUpdateBannerProps {
    banner: IBanner
}

export const UpdateBannerForm: React.FC<IFormUpdateBannerProps> = ({
    banner,
}) => {
    const queryClient = useQueryClient()
    const { t } = useTranslation(['banner'])
    const { t: tToast } = useTranslation('toast')
    const { mutate: updateBanner } = useUpdateBanner()
    const form = useForm<TBannerUpdateSchema>(
        {
            mode: "onChange",
            resolver: zodResolver(bannerUpadateSchema),
            defaultValues: {
                slug: banner?.slug || '',
                title: banner?.title || '',
                content: banner?.content || '',
                url: banner?.url || '',
                useButtonUrl: banner?.useButtonUrl,
                isActive: banner?.isActive,
            },
        })

    const handleSubmit = () => {
        updateBanner(form.getValues(), {
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: [QUERYKEY.banners],
                    exact: false,
                    refetchType: 'all',
                })
                showToast(tToast('toast.updateBannerSuccess'))
            }
        })
    }

    const formFields = {
        title: (
            <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('banner.title')}</FormLabel>
                        <FormControl>
                            <Input
                                {...field}
                                placeholder={t('banner.enterTitle')}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        ),
        content: (
            <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('banner.content')}</FormLabel>
                        <FormControl>
                            <Input
                                {...field}
                                placeholder={t('banner.enterContent')}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        ),
        useButtonUrl: (
            <>
                <FormField
                    control={form.control}
                    name="useButtonUrl"
                    render={() => (
                        <FormItem className="flex items-center gap-4">
                            <FormControl className="flex items-center">
                                <div className="flex items-center gap-4 py-2">
                                    <Label>{t('banner.btnLink')}</Label>
                                    <Switch defaultChecked={form.watch('useButtonUrl')}
                                        onCheckedChange={(checked) => {
                                            form.setValue("useButtonUrl", checked)
                                        }} />
                                </div>
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                        <FormItem className={`${form.watch('useButtonUrl') ? 'block' : 'hidden'} mt-1`}>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder={t('banner.enterLink')}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )
                    } />
            </>
        ),
    }
    return (
        <div className="mt-3">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <div className='flex flex-col gap-6'>
                        <div className="grid grid-cols-1 gap-4">
                            {Object.keys(formFields).map((key) => (
                                <React.Fragment key={key}>
                                    {formFields[key as keyof typeof formFields]}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="button" onClick={() => handleSubmit()} disabled={!form.formState.isValid || (form.watch('useButtonUrl') && form.watch("url").length === 0)}>
                            {t('banner.update')}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
