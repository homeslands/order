import { useState } from 'react'
import { useParams } from 'react-router-dom'
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
  Switch,
} from '@/components/ui'
import { ConfirmCreateMultipleVoucherDialog } from '@/components/app/dialog'
import { ICreateMultipleVoucherRequest } from '@/types'
import { SimpleDatePicker } from '../picker'
import { createMultipleVoucherSchema, TCreateMultipleVoucherSchema } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { VoucherTypeSelect } from '../select'
import { VOUCHER_TYPE } from '@/constants'

export default function CreateMultipleVoucherSheet({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation(['voucher'])
  const { slug } = useParams()
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<ICreateMultipleVoucherRequest | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const form = useForm<TCreateMultipleVoucherSchema>({
    resolver: zodResolver(createMultipleVoucherSchema),
    defaultValues: {
      voucherGroup: slug as string,
      numberOfVoucher: 2,
      title: '',
      description: '',
      type: VOUCHER_TYPE.PERCENT_ORDER,
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      value: 0,
      isActive: false,
      isPrivate: false,
      numberOfUsagePerUser: 1,
      maxUsage: 0,
      minOrderValue: 0,
      isVerificationIdentity: true
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

  const handleSubmit = (data: ICreateMultipleVoucherRequest) => {
    setFormData(data)
    setIsOpen(true)
  }

  const resetForm = () => {
    form.reset({
      voucherGroup: slug as string,
      title: '',
      description: '',
      type: VOUCHER_TYPE.PERCENT_ORDER,
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      value: 0,
      isActive: false,
      isPrivate: false,
      numberOfUsagePerUser: 1,
      maxUsage: 0,
      minOrderValue: 0,
      isVerificationIdentity: true
    })
  }

  const formFields = {
    name: (
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className='flex gap-1 items-center'>
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
            <FormLabel className='flex gap-1 items-center'>
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
    numberOfVoucher: (
      <FormField
        control={form.control}
        name="numberOfVoucher"
        render={({ field }) => (
          <FormItem>
            <FormLabel className='flex gap-1 items-center'>
              <span className="text-destructive">
                *
              </span>
              {t('voucher.numberOfVoucher')}</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
                min={0}
                placeholder={t('voucher.enterNumberOfVoucher')}
              />
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
            <FormLabel className='flex gap-1 items-center'>
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
            <FormLabel className='flex gap-1 items-center'>
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
    type: (
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel className='flex gap-1 items-center'>
              <span className="text-destructive">
                *
              </span>
              {t('voucher.type')}</FormLabel>
            <FormControl>
              <VoucherTypeSelect
                {...field}
                onChange={(value) => {
                  field.onChange(value);
                  form.setValue('value', 0); // Reset value when type changes
                }}
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
            <FormLabel className='flex gap-1 items-center'>
              <span className="text-destructive">
                *
              </span>
              {t('voucher.value')}</FormLabel>
            <FormControl>
              {form.watch('type') === 'percent_order' ? (
                <div className='relative'>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    min={0}
                    max={100}
                    placeholder={t('voucher.enterVoucherValue')}
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                </div>
              ) : (
                <div className='relative'>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder={t('voucher.enterVoucherValue')}
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    ₫
                  </span>
                </div>
              )}
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
            <FormLabel className='flex gap-1 items-center'>
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
    numberOfUsagePerUser: (
      <FormField
        control={form.control}
        name="numberOfUsagePerUser"
        render={({ field }) => (
          <FormItem>
            <FormLabel className='flex gap-1 items-center'>
              <span className="text-destructive">
                *
              </span>
              {t('voucher.numberOfUsagePerUser')}</FormLabel>
            <FormControl>
              <div className='relative'>
                <Input
                  type="number"
                  {...field}
                  placeholder={t('voucher.enterNumberOfUsagePerUser')}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  {t('voucher.usage')}
                </span>
              </div>
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
            <FormLabel className='flex gap-1 items-center'>
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
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  ₫
                </span>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    isVerificationIdentity: (
      <FormField
        control={form.control}
        name="isVerificationIdentity"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex gap-1 items-center">
              <span className="text-destructive">*</span>
              {t('voucher.isVerificationIdentity')}
            </FormLabel>
            <FormControl>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-verification-identity"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    isPrivate: (
      <FormField
        control={form.control}
        name="isPrivate"
        render={({ field }) => (
          <FormItem className='flex flex-col gap-2'>
            <FormLabel className="flex gap-1 items-start leading-6">
              <span className="mt-1 text-destructive">*</span>
              {t('voucher.isPrivate')}
            </FormLabel>

            <FormControl>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-private"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
  }

  const handleCreateVoucherSuccess = () => {
    resetForm()
    onSuccess()
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button>
          <PlusCircle size={16} />
          {t('voucher.createMultiple')}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-3xl">
        <SheetHeader className="p-4">
          <SheetTitle className="text-primary">
            {t('voucher.createMultiple')}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full bg-transparent backdrop-blur-md">
          <ScrollArea className="max-h-[calc(100vh-8rem)] flex-1 gap-4 p-4 bg-muted-foreground/10">
            {/* Voucher name and description */}
            <div className="flex flex-col flex-1">
              <Form {...form}>
                <form id="voucher-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  {/* Nhóm: Tên và Mô tả */}
                  <div className={`p-4 bg-white rounded-md border dark:bg-transparent`}>
                    <div className="grid grid-cols-1 gap-2">
                      {formFields.name}
                      {formFields.description}
                    </div>
                  </div>

                  {/* Nhóm: Ngày bắt đầu và Kết thúc */}
                  <div className={`grid grid-cols-2 gap-2 p-4 bg-white rounded-md border dark:bg-transparent`}>
                    {formFields.startDate}
                    {formFields.endDate}
                  </div>

                  {/* Nhóm: Mã giảm giá & Số lượng */}
                  <div className={`grid grid-cols-2 gap-2 p-4 bg-white rounded-md border dark:bg-transparent`}>
                    {formFields.type}
                    {formFields.numberOfVoucher}
                  </div>

                  {/* Nhóm: Giá trị đơn hàng tối thiểu */}
                  <div className={`grid grid-cols-2 gap-2 p-4 bg-white rounded-md border dark:bg-transparent`}>
                    {formFields.minOrderValue}
                    {formFields.value}
                  </div>
                  {/* Nhóm: Số lượng sử dụng */}
                  <div className={`grid grid-cols-2 gap-2 p-4 bg-white rounded-md border dark:bg-transparent`}>
                    {formFields.maxUsage}
                    {formFields.numberOfUsagePerUser}
                  </div>
                  {/* Nhóm: Kiểm tra định danh */}
                  <div className={`flex flex-col gap-4 p-4 bg-white rounded-md border dark:bg-transparent`}>
                    {formFields.isVerificationIdentity}
                    {formFields.isPrivate}
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
              <ConfirmCreateMultipleVoucherDialog
                voucher={formData}
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                onCloseSheet={() => setSheetOpen(false)}
                onSuccess={handleCreateVoucherSuccess}
              />
            )}
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
