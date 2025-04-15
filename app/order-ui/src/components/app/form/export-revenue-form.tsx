import moment from 'moment'
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
    Button,
} from '@/components/ui'
import { exportRevenueSchema, TExportRevenueSchema } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { RevenueTypeQuery } from '@/constants'
import { DateAndTimePicker, SimpleDatePicker } from '../picker'
import { IRevenueQuery } from '@/types'
import { useBranchStore } from '@/stores'

interface IFormExportRevenueProps {
    type: RevenueTypeQuery
    onSubmit: (data: IRevenueQuery) => void
    onSuccess: () => void
}

export const ExportRevenueForm: React.FC<IFormExportRevenueProps> = ({
    onSubmit,
    type,
}) => {
    const { t } = useTranslation(['revenue'])
    const { branch } = useBranchStore()

    const form = useForm<TExportRevenueSchema>({
        resolver: zodResolver(exportRevenueSchema),
        defaultValues: {
            branch: branch?.slug,
            startDate: type === RevenueTypeQuery.HOURLY ? moment().format('YYYY-MM-DD HH:mm:ss') : moment().format('YYYY-MM-DD'),
            endDate: type === RevenueTypeQuery.HOURLY ? moment().format('YYYY-MM-DD HH:mm:ss') : moment().format('YYYY-MM-DD'),
            type: type || RevenueTypeQuery.DAILY,
        },
    })

    React.useEffect(() => {
        form.reset({
            branch: branch?.slug,
            startDate: type === RevenueTypeQuery.HOURLY
                ? moment().format('YYYY-MM-DD HH:mm:ss')
                : moment().format('YYYY-MM-DD'),
            endDate: type === RevenueTypeQuery.HOURLY
                ? moment().format('YYYY-MM-DD HH:mm:ss')
                : moment().format('YYYY-MM-DD'),
            type: type || RevenueTypeQuery.DAILY,
        })
    }, [type, branch?.slug, form])


    const handleSubmit = (data: IRevenueQuery) => {
        onSubmit(data)
    }

    const formFields = {
        startDate: (
            <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className='font-bold'>{t('revenue.startDate')}</FormLabel>
                        <FormControl>
                            {type === RevenueTypeQuery.HOURLY ? (
                                <DateAndTimePicker
                                    date={field.value}
                                    onChange={field.onChange}
                                    showTime={true}
                                    startDate={form.getValues('startDate')}
                                />
                            ) : (
                                <SimpleDatePicker
                                    value={field.value}
                                    onChange={(date) => field.onChange(date)}
                                />
                            )}
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        ),
        endDate: (
            <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className='font-bold'>{t('revenue.endDate')}</FormLabel>
                        <FormControl>

                            {type === RevenueTypeQuery.HOURLY ? (
                                <DateAndTimePicker
                                    date={field.value}
                                    onChange={field.onChange}
                                    showTime={true}
                                    endDate={form.getValues('endDate')}
                                />
                            ) : (
                                <SimpleDatePicker
                                    value={field.value}
                                    onChange={(date) => field.onChange(date)}
                                />
                            )}
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
                <form onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-6">
                    <div className="grid grid-cols-2 gap-2">
                        {Object.keys(formFields).map((key) => (
                            <React.Fragment key={key}>
                                {formFields[key as keyof typeof formFields]}
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="flex justify-end">
                        <Button className="flex justify-end" type="submit">
                            {t('revenue.apply')}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
