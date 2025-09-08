import moment from 'moment'
import React, { useEffect, useState } from 'react'
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
    const { overviewFilter, setOverviewFilter } = useOverviewFilterStore()

    const [localStartDate, setLocalStartDate] = useState<string>('')
    const [localEndDate, setLocalEndDate] = useState<string>('')
    const [localType, setLocalType] = useState<RevenueTypeQuery>(type)

    const getDefaultValues = React.useCallback(() => {
        // Ưu tiên sử dụng giá trị từ store nếu có
        const storeStartDate = overviewFilter.startDate
        const storeEndDate = overviewFilter.endDate
        const storeType = overviewFilter.type

        const defaultStartDate = type === RevenueTypeQuery.HOURLY ? moment().startOf('day').format('YYYY-MM-DD HH:mm:ss') : moment().format('YYYY-MM-DD')
        const defaultEndDate = type === RevenueTypeQuery.HOURLY ? moment().format('YYYY-MM-DD HH:mm:ss') : moment().format('YYYY-MM-DD')

        return {
            branch: branch?.slug || '',
            startDate: localStartDate || storeStartDate || defaultStartDate,
            endDate: localEndDate || storeEndDate || defaultEndDate,
            type: localType || storeType || type || RevenueTypeQuery.HOURLY,
        }
    }, [branch?.slug, type, localStartDate, localEndDate, localType, overviewFilter])

    const form = useForm<TExportRevenueSchema>({
        resolver: zodResolver(useExportRevenueSchema()),
        defaultValues: getDefaultValues(),
    })

    useEffect(() => {
        const defaultValues = getDefaultValues()

        form.setValue('branch', defaultValues.branch)
        form.setValue('type', defaultValues.type)
        form.setValue('startDate', defaultValues.startDate)
        form.setValue('endDate', defaultValues.endDate)

        setLocalType(defaultValues.type)
        // Chỉ set local state nếu chưa có giá trị
        if (!localStartDate) setLocalStartDate(defaultValues.startDate)
        if (!localEndDate) setLocalEndDate(defaultValues.endDate)
    }, [type, branch?.slug, form, getDefaultValues, localStartDate, localEndDate, overviewFilter])

    // Reset local state when overviewFilter is cleared
    useEffect(() => {
        if (!overviewFilter.startDate && !overviewFilter.endDate && !overviewFilter.type) {
            const defaultStartDate = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss')
            const defaultEndDate = moment().format('YYYY-MM-DD HH:mm:ss')
            const defaultType = RevenueTypeQuery.HOURLY

            setLocalStartDate(defaultStartDate)
            setLocalEndDate(defaultEndDate)
            setLocalType(defaultType)

            form.setValue('startDate', defaultStartDate)
            form.setValue('endDate', defaultEndDate)
            form.setValue('type', defaultType)
        }
    }, [overviewFilter, form])


    const handleSubmit = (data: IRevenueQuery) => {
        // Update overview filter
        setOverviewFilter({
            ...overviewFilter,
            startDate: localStartDate || data.startDate || '',
            endDate: localEndDate || data.endDate || '',
            type: localType || data.type || RevenueTypeQuery.HOURLY
        })

        // Đảm bảo sử dụng giá trị từ local state nếu có
        const submitData = {
            ...data,
            startDate: localStartDate || data.startDate,
            endDate: localEndDate || data.endDate,
            type: localType || data.type
        }

        onSubmit(submitData)
    }

    const handleDateChange = (fieldName: 'startDate' | 'endDate', date: string | null) => {
        if (date) {
            let normalizedDate: string
            if (type === RevenueTypeQuery.HOURLY) {
                normalizedDate = moment(date, ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD', 'DD/MM/YYYY HH:mm', 'DD/MM/YYYY']).format('YYYY-MM-DD HH:mm:ss')
            } else {
                normalizedDate = moment(date, ['YYYY-MM-DD', 'DD/MM/YYYY']).format('YYYY-MM-DD')
            }

            form.setValue(fieldName, normalizedDate)
            form.trigger(['startDate', 'endDate'])

            if (fieldName === 'startDate') {
                setLocalStartDate(normalizedDate)
            } else {
                setLocalEndDate(normalizedDate)
            }
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
