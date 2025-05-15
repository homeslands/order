import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { PenLine } from 'lucide-react'

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
import { ConfirmUpdateVoucherDialog } from '@/components/app/dialog'
import { IUpdateVoucherRequest, IVoucher } from '@/types'
import { SimpleDatePicker } from '../picker'
import { TUpdateVoucherSchema, updateVoucherSchema } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { VoucherTypeSelect } from '../select'

interface IUpdateVoucherSheetProps {
  voucher: IVoucher
  onSuccess?: () => void
}

export default function UpdateVoucherSheet({
  voucher,
  onSuccess,
}: IUpdateVoucherSheetProps) {
  const { t } = useTranslation(['voucher'])
  const { slug } = useParams()
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<IUpdateVoucherRequest | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const form = useForm<TUpdateVoucherSchema>({
    resolver: zodResolver(updateVoucherSchema),
    defaultValues: {
      slug: voucher.slug,
      voucherGroup: slug as string,
      createdAt: voucher.createdAt,
      title: voucher.title,
      description: voucher.description,
      type: voucher.type,
      startDate: voucher.startDate,
      endDate: voucher.endDate,
      code: voucher.code,
      value: voucher.value,
      remainingUsage: voucher.remainingUsage,
      maxUsage: voucher.maxUsage,
      isActive: voucher.isActive,
      isPrivate: voucher.isPrivate,
      numberOfUsagePerUser: voucher.numberOfUsagePerUser,
      minOrderValue: voucher.minOrderValue,
      isVerificationIdentity: voucher.isVerificationIdentity,
    },
  })

  // Use useWatch to watch type field without causing re-renders
  // const voucherType = useWatch({
  //   control: form.control,
  //   name: 'type',
  //   defaultValue: voucher.type
  // })

  const isDateBeforeToday = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const isDateBeforeStartDate = (date: Date) => {
    const startDate = form.getValues('startDate')
    if (!startDate) return false
    const startDateObj = new Date(startDate)
    return date <= startDateObj
  }

  const handleDateChange = (fieldName: 'startDate' | 'endDate', date: string) => {
    if (fieldName === 'startDate') {
      // Nếu thay đổi ngày bắt đầu, xóa ngày kết thúc nếu nó trước ngày bắt đầu mới
      const currentEndDate = form.getValues('endDate')
      if (currentEndDate && new Date(currentEndDate) <= new Date(date)) {
        form.setValue('endDate', '')
      }
    }
    form.setValue(fieldName, date)
  }

  const handleSubmit = (data: IUpdateVoucherRequest) => {
    // Ensure value is converted to number before submitting
    const submissionData = {
      ...data,
      value: Number(data.value)
    };
    setFormData(submissionData);
    setIsOpen(true);
  }

  // Add onSubmit handler directly to form element
  const onSubmit = form.handleSubmit((data) => {
    handleSubmit(data as IUpdateVoucherRequest);
  });

  // const handleClick = (e: React.MouseEvent) => {
  //   e.preventDefault()
  //   e.stopPropagation()
  //   setSheetOpen(true)
  // }

  const formFields = {
    title: (
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex gap-1 items-center">
              <span className="text-destructive">*</span>
              {t('voucher.title')}
            </FormLabel>
            <FormControl>
              <Input {...field} placeholder={t('voucher.enterVoucherTitle')} />
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
            <FormLabel className="flex gap-1 items-center">
              <span className="text-destructive">*</span>
              {t('voucher.description')}
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t('voucher.enterVoucherDescription')}
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
            <FormLabel className="flex gap-1 items-center">
              <span className="text-destructive">*</span>
              {t('voucher.startDate')}
            </FormLabel>
            <FormControl>
              <SimpleDatePicker
                {...field}
                onChange={(date) => handleDateChange('startDate', date)}
                disabledDates={isDateBeforeToday}
              />
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
            <FormLabel className="flex gap-1 items-center">
              <span className="text-destructive">*</span>
              {t('voucher.endDate')}
            </FormLabel>
            <FormControl>
              <SimpleDatePicker
                {...field}
                onChange={(date) => handleDateChange('endDate', date)}
                disabledDates={isDateBeforeStartDate}
              />
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
                defaultValue={field.value}
                {...field}
                onChange={(value) => {
                  field.onChange(value);
                }}
              />
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
            <FormLabel className="flex gap-1 items-center">
              <span className="text-destructive">*</span>
              {t('voucher.code')}
            </FormLabel>
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
        defaultValue={voucher.value}
        render={({ field }) => (
          <FormItem className='flex flex-col justify-between'>
            <FormLabel className='flex gap-1 items-center'>
              <span className="text-destructive">*</span>
              {t('voucher.value')}
            </FormLabel>
            <FormControl>
              {form.watch('type') === 'percent_order' ? (
                <div className='relative'>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Nếu người dùng xóa trắng input thì gán chuỗi rỗng
                      if (value === '') {
                        field.onChange(''); // hoặc null tùy theo schema
                      } else {
                        field.onChange(Number(value));
                      }
                    }}
                    value={field.value === 0 ? '' : field.value} // giữ UI sạch khi là 0
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
                    onChange={(e) => {
                      const value = e.target.value;
                      // Nếu người dùng xóa trắng input thì gán chuỗi rỗng
                      if (value === '') {
                        field.onChange(''); // hoặc null tùy theo schema
                      } else {
                        field.onChange(Number(value));
                      }
                    }}
                    value={field.value === 0 ? '' : field.value} // giữ UI sạch khi là 0
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
            <FormLabel className="flex gap-1 items-center">
              <span className="text-destructive">*</span>
              {t('voucher.maxUsage')}
            </FormLabel>
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
            <FormLabel className="flex gap-1 items-center">
              <span className="text-destructive">*</span>
              {t('voucher.minOrderValue')}
            </FormLabel>
            <FormControl>
              <div className='relative'>
                <Input
                  type="number"
                  {...field}
                  placeholder={t('voucher.enterMinOrderValue')}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  min={0}
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
    isActive: (
      <FormField
        control={form.control}
        name="isActive"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex gap-1 items-center">
              <span className="text-destructive">*</span>
              {t('voucher.isActive')}
            </FormLabel>
            <FormControl>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-active"
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
          <FormItem>
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

  const handleUpdateVoucherSuccess = () => {
    setSheetOpen(false)
    onSuccess?.()
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="gap-1 px-2">
          <PenLine className="icon" />
          {t('voucher.update')}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-3xl">
        <SheetHeader className="p-4">
          <SheetTitle className="text-primary">
            {t('voucher.update')}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full bg-transparent backdrop-blur-md">
          <ScrollArea className="max-h-[calc(100vh-8rem)] flex-1 gap-4 bg-muted-foreground/10 p-4">
            {/* Voucher name and description */}
            <div className="flex flex-col flex-1">
              <Form {...form}>
                <form
                  id="voucher-form"
                  onSubmit={onSubmit}
                  className="space-y-4"
                >
                  {/* Nhóm: Tên và Mô tả */}
                  <div className="p-4 bg-white rounded-md border">
                    <div className="grid grid-cols-1 gap-2">
                      {formFields.title}
                      {formFields.description}
                    </div>
                  </div>

                  {/* Nhóm: Ngày bắt đầu và Kết thúc */}
                  <div className="grid grid-cols-2 gap-2 p-4 bg-white rounded-md border">
                    {formFields.startDate}
                    {formFields.endDate}
                  </div>

                  {/* Nhóm: Mã giảm giá & Số lượng */}
                  <div className="grid grid-cols-2 gap-2 p-4 bg-white rounded-md border">
                    {formFields.code}
                    {formFields.type}
                  </div>

                  {/* Nhóm: Giá trị đơn hàng tối thiểu */}
                  <div className="grid grid-cols-2 gap-2 p-4 bg-white rounded-md border">
                    {formFields.minOrderValue}
                    {formFields.value}
                  </div>

                  {/* Nhóm: Số lượng sử dụng */}
                  <div className={`grid grid-cols-2 gap-2 p-4 bg-white rounded-md border dark:bg-transparent`}>
                    {formFields.maxUsage}
                    {formFields.numberOfUsagePerUser}
                  </div>

                  {/* Nhóm: Kích hoạt voucher */}
                  <div className="flex flex-col gap-4 p-4 bg-white rounded-md border dark:bg-transparent">
                    {formFields.isActive}
                    {formFields.isPrivate}
                  </div>

                  {/* Nhóm: Kiểm tra định danh */}
                  <div className="grid grid-cols-1 p-4 bg-white rounded-md border">
                    {formFields.isVerificationIdentity}
                  </div>
                </form>
              </Form>
            </div>
          </ScrollArea>
          <SheetFooter className="p-4">
            <Button
              type="submit"
              form="voucher-form"
            >
              {t('voucher.update')}
            </Button>
            {isOpen && (
              <ConfirmUpdateVoucherDialog
                voucher={formData}
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                onCloseSheet={() => setSheetOpen(false)}
                onSuccess={handleUpdateVoucherSuccess}
              />
            )}
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
