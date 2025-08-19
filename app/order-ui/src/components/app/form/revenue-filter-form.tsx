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
import { useExportRevenueSchema, TExportRevenueSchema } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { RevenueTypeQuery } from '@/constants'
import { DateAndTimePicker, SimpleDatePicker } from '../picker'
import { IRevenueQuery } from '@/types'
import { useBranchStore, useOverviewFilterStore } from '@/stores'

interface IRevenueFilterFormProps {
    type: RevenueTypeQuery
    onSubmit: (data: IRevenueQuery) => void
    onSuccess: () => void
}

export const RevenueFilterForm: React.FC<IRevenueFilterFormProps> = ({
    onSubmit,
    type,
}) => {
    const { t } = useTranslation(['revenue'])
    const { branch } = useBranchStore()
    const { overviewFilter } = useOverviewFilterStore()

    const getDefaultValues = React.useCallback(() => {
        // Nếu có savedValues, sử dụng chúng
        if (overviewFilter) {
            return {
                branch: overviewFilter.branch || branch?.slug,
                startDate: overviewFilter.startDate || (type === RevenueTypeQuery.HOURLY ? moment().startOf('day').format('YYYY-MM-DD HH:mm:ss') : moment().format('YYYY-MM-DD')),
                endDate: overviewFilter.endDate || (type === RevenueTypeQuery.HOURLY ? moment().format('YYYY-MM-DD HH:mm:ss') : moment().format('YYYY-MM-DD')),
                type: type || RevenueTypeQuery.DAILY,
            }
        }

        // Ngược lại sử dụng giá trị mặc định
        return {
            branch: branch?.slug,
            startDate: type === RevenueTypeQuery.HOURLY ? moment().startOf('day').format('YYYY-MM-DD HH:mm:ss') : moment().format('YYYY-MM-DD'),
            endDate: type === RevenueTypeQuery.HOURLY ? moment().format('YYYY-MM-DD HH:mm:ss') : moment().format('YYYY-MM-DD'),
            type: type || RevenueTypeQuery.DAILY,
        }
    }, [overviewFilter, branch?.slug, type])

    const form = useForm<TExportRevenueSchema>({
        resolver: zodResolver(useExportRevenueSchema()),
        defaultValues: getDefaultValues(),
    })

    React.useEffect(() => {
        const defaultValues = getDefaultValues()

        // Cập nhật form với giá trị mặc định hoặc savedValues
        form.setValue('branch', defaultValues.branch || '')
        form.setValue('type', defaultValues.type)

        // Chỉ cập nhật dates nếu có savedValues hoặc form chưa có giá trị
        const currentValues = form.getValues()
        if (overviewFilter || !currentValues.startDate || !currentValues.endDate) {
            form.setValue('startDate', defaultValues.startDate)
            form.setValue('endDate', defaultValues.endDate)
        }
    }, [type, branch?.slug, overviewFilter, form, getDefaultValues])


    const handleSubmit = (data: IRevenueQuery) => {
        // console.log(data)
        onSubmit(data)
    }

    const handleDateChange = (fieldName: 'startDate' | 'endDate', date: string | null) => {
        if (date) {
            // For hourly type, keep the full datetime format, otherwise just date
            let normalizedDate: string
            if (type === RevenueTypeQuery.HOURLY) {
                // Keep the datetime format YYYY-MM-DD HH:mm:ss for hourly reports
                normalizedDate = moment(date, ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD', 'DD/MM/YYYY HH:mm', 'DD/MM/YYYY']).format('YYYY-MM-DD HH:mm:ss')
            } else {
                // For daily/other types, just use date format
                normalizedDate = moment(date, ['YYYY-MM-DD', 'DD/MM/YYYY']).format('YYYY-MM-DD')
            }
            form.setValue(fieldName, normalizedDate)
            form.trigger(['startDate', 'endDate'])
        }
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
                                    onSelect={(date) => handleDateChange('startDate', date)}
                                    validateDate={(date) => date <= new Date()}
                                    disableFutureDate
                                    showTime={true}
                                />
                            ) : (
                                <SimpleDatePicker
                                    value={field.value}
                                    onChange={(date) => handleDateChange('startDate', date)}
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
                                    onSelect={(date) => handleDateChange('endDate', date)}
                                    validateDate={(date) => date <= new Date()}
                                    disableFutureDate
                                    showTime={true}
                                />
                            ) : (
                                <SimpleDatePicker
                                    value={field.value}
                                    onChange={(date) => handleDateChange('endDate', date)}
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
