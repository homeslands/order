import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { PlusCircle } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Button,
  ScrollArea,
  Input,
  SheetFooter,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from '@/components/ui'
import { CreateVoucherDialog } from '@/components/app/dialog'
import { ICreateVoucherRequest } from '@/types'
import { SimpleDatePicker } from '../picker'
import { createVoucherSchema, TCreateVoucherSchema } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'

export default function CreateVoucherSheet() {
  const { t } = useTranslation(['voucher'])
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<ICreateVoucherRequest | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const form = useForm<TCreateVoucherSchema>({
    resolver: zodResolver(createVoucherSchema),
    defaultValues: {
      title: '',
      description: '',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      code: '',
      value: 0,
      isActive: false,
      maxUsage: 0,
      minOrderValue: 0
    }
  })

  const disableStartDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const disableEndDate = (date: Date) => {
    const startDate = form.getValues('startDate')
    if (!startDate) return false

    const selectedStartDate = new Date(startDate)
    selectedStartDate.setHours(0, 0, 0, 0)
    return date < selectedStartDate
  }

  const handleDateChange = (fieldName: 'startDate' | 'endDate', date: string) => {
    form.setValue(fieldName, date)
  }

  const handleSubmit = (data: ICreateVoucherRequest) => {
    setFormData(data)
    setIsOpen(true)
  }

  const resetForm = () => {
    form.reset({
      title: '',
      description: '',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      code: '',
      value: 0,
      isActive: false,
      maxUsage: 0,
      minOrderValue: 0
    })
  }

  const formFields = {
    name: (
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className='flex items-center gap-1'>
              <span className="text-destructive">
                *
              </span>
              {t('voucher.name')}</FormLabel>
            <FormControl>
              <Input {...field} placeholder={t('voucher.enterVoucherName')} />
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
            <FormLabel className='flex items-center gap-1'>
              <span className="text-destructive">
                *
              </span>
              {t('voucher.description')}</FormLabel>
            <FormControl>
              <Input {...field} placeholder={t('voucher.enterVoucherDescription')} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    startDate: (
      <FormField
        control={form.control}
        name="startDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel className='flex items-center gap-1'>
              <span className="text-destructive">
                *
              </span>
              {t('voucher.startDate')}</FormLabel>
            <FormControl>
              <SimpleDatePicker {...field} onChange={(date) => handleDateChange('startDate', date)} disabledDates={disableStartDate} />
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
            <FormLabel className='flex items-center gap-1'>
              <span className="text-destructive">
                *
              </span>
              {t('voucher.endDate')}</FormLabel>
            <FormControl>
              <SimpleDatePicker {...field} onChange={(date) => handleDateChange('endDate', date)} disabledDates={disableEndDate} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    code: (
      <FormField
        control={form.control}
        name="code"
        render={({ field }) => (
          <FormItem>
            <FormLabel className='flex items-center gap-1'>
              <span className="text-destructive">
                *
              </span>
              {t('voucher.code')}</FormLabel>
            <FormControl>
              <Input
                type="text"
                {...field}
                placeholder={t('voucher.enterVoucherCode')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    value: (
      <FormField
        control={form.control}
        name="value"
        render={({ field }) => (
          <FormItem className='flex flex-col justify-between'>
            <FormLabel className='flex items-center gap-1'>
              <span className="text-destructive">
                *
              </span>
              {t('voucher.value')}</FormLabel>
            <FormControl>
              <div className='relative'>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => {
                    const displayValue = Number(e.target.value)
                    if (displayValue >= 0 && displayValue <= 100) {
                      field.onChange(displayValue)
                    }
                  }}
                  min={0}
                  max={100}
                  placeholder={t('voucher.enterVoucherValue')}
                />
                <span className="absolute transform -translate-y-1/2 right-2 top-1/2 text-muted-foreground">
                  %
                </span>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    maxUsage: (
      <FormField
        control={form.control}
        name="maxUsage"
        render={({ field }) => (
          <FormItem>
            <FormLabel className='flex items-center gap-1'>
              <span className="text-destructive">
                *
              </span>
              {t('voucher.maxUsage')}</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
                min={0}
                placeholder={t('voucher.enterVoucherMaxUsage')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    minOrderValue: (
      <FormField
        control={form.control}
        name="minOrderValue"
        render={({ field }) => (
          <FormItem>
            <FormLabel className='flex items-center gap-1'>
              <span className="text-destructive">
                *
              </span>
              {t('voucher.minOrderValue')}</FormLabel>
            <FormControl>
              <div className='relative'>
                <Input
                  type="number"
                  {...field}
                  placeholder={t('voucher.enterMinOrderValue')}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
                <span className="absolute transform -translate-y-1/2 right-2 top-1/2 text-muted-foreground">
                  ₫
                </span>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button>
          <PlusCircle size={16} />
          {t('voucher.create')}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-3xl">
        <SheetHeader className="p-4">
          <SheetTitle className="text-primary">
            {t('voucher.create')}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full bg-transparent backdrop-blur-md">
          <ScrollArea className="max-h-[calc(100vh-8rem)] flex-1 gap-4 p-4 bg-muted-foreground/10">
            {/* Voucher name and description */}
            <div className="flex flex-col flex-1">
              <Form {...form}>
                <form id="voucher-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  {/* Nhóm: Tên và Mô tả */}
                  <div className={`p-4 border bg-white dark:bg-transparent rounded-md`}>
                    <div className="grid grid-cols-1 gap-2">
                      {formFields.name}
                      {formFields.description}
                    </div>
                  </div>

                  {/* Nhóm: Ngày bắt đầu và Kết thúc */}
                  <div className={`grid grid-cols-2 gap-2 p-4 bg-white dark:bg-transparent border rounded-md`}>
                    {formFields.startDate}
                    {formFields.endDate}
                  </div>

                  {/* Nhóm: Mã giảm giá & Số lượng */}
                  <div className={`grid grid-cols-2 gap-2 p-4 bg-white dark:bg-transparent border rounded-md`}>
                    {formFields.code}
                    {formFields.maxUsage}
                  </div>

                  {/* Nhóm: Giá trị đơn hàng tối thiểu */}
                  <div className={`grid grid-cols-2 gap-2 p-4 bg-white dark:bg-transparent border rounded-md`}>
                    {formFields.minOrderValue}
                    {formFields.value}
                  </div>
                </form>
              </Form>
            </div>
          </ScrollArea>
          <SheetFooter className="p-4">
            <Button type="submit" form="voucher-form">
              {t('voucher.create')}
            </Button>
            {isOpen && (
              <CreateVoucherDialog
                voucher={formData}
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                onCloseSheet={() => setSheetOpen(false)}
                onSuccess={resetForm} // Thêm callback onSuccess
              />
            )}
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
