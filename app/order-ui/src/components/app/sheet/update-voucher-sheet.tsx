import { useState, useEffect } from 'react'
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
import { VoucherApplicabilityRuleSelect, VoucherTypeSelect } from '../select'
import { useSpecificVoucher } from '@/hooks'
import { APPLICABILITY_RULE, VOUCHER_TYPE } from '@/constants'

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
  const { data: specificVoucher } = useSpecificVoucher({ slug: voucher.slug })

  const specificVoucherData = specificVoucher?.result

  const form = useForm<TUpdateVoucherSchema>({
    resolver: zodResolver(updateVoucherSchema),
    defaultValues: {
      slug: '',
      voucherGroup: slug as string,
      createdAt: '',
      title: '',
      applicabilityRule: APPLICABILITY_RULE.ALL_REQUIRED,
      description: '',
      type: '',
      startDate: '',
      endDate: '',
      code: '',
      value: 0,
      remainingUsage: 0,
      maxUsage: 0,
      isActive: false,
      isPrivate: false,
      numberOfUsagePerUser: 0,
      minOrderValue: 0,
      isVerificationIdentity: false,
      products: [],
    },
  })

  // Chỉ cập nhật form values khi specificVoucherData được load lần đầu
  useEffect(() => {
    if (specificVoucherData) {
      form.reset({
        slug: specificVoucherData.slug,
        voucherGroup: slug as string,
        createdAt: specificVoucherData.createdAt,
        title: specificVoucherData.title,
        applicabilityRule: specificVoucherData.applicabilityRule,
        description: specificVoucherData.description,
        type: specificVoucherData.type,
        startDate: specificVoucherData.startDate,
        endDate: specificVoucherData.endDate,
        code: specificVoucherData.code,
        value: specificVoucherData.value,
        remainingUsage: specificVoucherData.remainingUsage,
        maxUsage: specificVoucherData.maxUsage,
        isActive: specificVoucherData.isActive,
        isPrivate: specificVoucherData.isPrivate,
        numberOfUsagePerUser: specificVoucherData.numberOfUsagePerUser,
        minOrderValue: specificVoucherData.minOrderValue,
        isVerificationIdentity: specificVoucherData.isVerificationIdentity,
        products: (specificVoucherData.voucherProducts || []).map((item: { slug?: string; product?: { slug?: string } } | string) =>
          typeof item === 'string' ? item : item.slug || item.product?.slug || ''
        ).filter(Boolean),
      })
    }
  }, [specificVoucherData, form, slug])

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
      // Nếu thay đổi ngày bắt đầu, cập nhật ngày kết thúc nếu nó trước ngày bắt đầu mới
      const currentEndDate = form.getValues('endDate')
      if (currentEndDate && new Date(currentEndDate) < new Date(date)) {
        form.setValue('endDate', date)
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
            <FormLabel className="flex items-center gap-1">
              <span className="text-destructive">*</span>
              {t('voucher.title')}
            </FormLabel>
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
            <FormLabel className="flex items-center gap-1">
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
            <FormLabel className="flex items-center gap-1">
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
            <FormLabel className="flex items-center gap-1">
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
            <FormLabel className='flex items-center gap-1'>
              <span className="text-destructive">
                *
              </span>
              {t('voucher.type')}</FormLabel>
            <FormControl>
              <VoucherTypeSelect
                disabled={true}
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
    applicabilityRule: (
      <FormField
        control={form.control}
        name="applicabilityRule"
        render={({ field }) => (
          <FormItem>
            <FormLabel className='flex items-center gap-1'>
              <span className="text-destructive">
                *
              </span>
              {t('voucher.applicabilityRule')}</FormLabel>
            <FormControl>
              <VoucherApplicabilityRuleSelect
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
            <FormLabel className="flex items-center gap-1">
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
            <FormLabel className='flex items-center gap-1'>
              <span className="text-destructive">*</span>
              {t('voucher.value')}
            </FormLabel>
            <FormControl>
              {form.watch('type') === VOUCHER_TYPE.PERCENT_ORDER ? (
                <div className='relative'>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Chỉ set number, không set empty string để tránh validation fail
                      if (value === '' || Number(value) <= 0) {
                        field.onChange(1); // Set minimum valid value for percent
                      } else {
                        const numValue = Number(value);
                        field.onChange(numValue > 100 ? 100 : numValue);
                      }
                    }}
                    value={field.value || 1}
                    min={1}
                    max={100}
                    placeholder={t('voucher.enterVoucherValue')}
                  />

                  <span className="absolute transform -translate-y-1/2 right-2 top-1/2 text-muted-foreground">
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
                      // Chỉ set number, không set empty string để tránh validation fail
                      if (value === '' || Number(value) <= 0) {
                        field.onChange(1000); // Set minimum valid value for fixed amount
                      } else {
                        field.onChange(Number(value));
                      }
                    }}
                    value={field.value || 1000}
                    min={1}
                    placeholder={t('voucher.enterVoucherValue')}
                  />
                  <span className="absolute transform -translate-y-1/2 right-2 top-1/2 text-muted-foreground">
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
    remainingUsage: (
      <FormField
        control={form.control}
        name="remainingUsage"
        render={({ field }) => (
          <FormItem>
            <FormLabel className='flex items-center gap-1'>
              {t('voucher.remainingUsage')}</FormLabel>
            <FormControl>
              <Input
                type="number"
                disabled
                {...field}
                placeholder={t('voucher.enterRemainingUsage')}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
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
            <FormLabel className="flex items-center gap-1">
              <span className="text-destructive">*</span>
              {t('voucher.voucherMaxUsage')}
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value === '' ? '' : Number(value));
                }}
                className='text-sm'
                value={field.value?.toString() ?? ''} // convert number -> string
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
            <FormLabel className='flex items-center gap-1'>
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
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === '' ? '' : Number(value));
                  }}
                  className='text-sm'
                  value={field.value?.toString() ?? ''} // convert number -> string
                />
                <span className="absolute transform -translate-y-1/2 right-2 top-1/2 text-muted-foreground">
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
            <FormLabel className="flex items-center gap-1">
              <span className="text-destructive">*</span>
              {t('voucher.minOrderValue')}
            </FormLabel>
            <FormControl>
              <div className='relative'>
                <Input
                  type="number"
                  {...field}
                  placeholder={t('voucher.enterMinOrderValue')}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === '' ? '' : Number(value));
                  }}
                  className='text-sm'
                  value={field.value?.toString() ?? ''} // convert number -> string
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
    ),
    isActive: (
      <FormField
        control={form.control}
        name="isActive"
        render={({ field }) => {
          const startDate = form.getValues('startDate')
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          const isStartDateAfterToday = startDate && new Date(startDate) > today || false

          return (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                {t('voucher.isActive')}
              </FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isStartDateAfterToday}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )
        }}
      />
    ),
    isVerificationIdentity: (
      <FormField
        control={form.control}
        name="isVerificationIdentity"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
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
            <FormLabel className="flex items-start gap-1 leading-6">
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
        <Button variant="ghost" className="flex justify-start w-full gap-1 px-2">
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
                  <div className="p-4 bg-white border rounded-md">
                    <div className="grid grid-cols-1 gap-2">
                      {formFields.title}
                      {formFields.description}
                    </div>
                  </div>

                  {/* Nhóm: Ngày bắt đầu và Kết thúc */}
                  <div className="grid grid-cols-2 gap-2 p-4 bg-white border rounded-md">
                    {formFields.startDate}
                    {formFields.endDate}
                  </div>

                  {/* Nhóm: Mã giảm giá & Số lượng */}
                  <div className="grid grid-cols-2 gap-2 p-4 bg-white border rounded-md">
                    {formFields.applicabilityRule}
                    {formFields.type}
                  </div>

                  {/* Nhóm: Code */}
                  <div className="grid grid-cols-2 gap-2 p-4 bg-white border rounded-md">
                    {formFields.code}
                    {formFields.value}
                  </div>

                  {/* Nhóm: Giá trị đơn hàng tối thiểu */}
                  <div className="grid grid-cols-1 gap-2 p-4 bg-white border rounded-md">
                    {formFields.minOrderValue}
                  </div>

                  {/* Nhóm: Số lượng sử dụng */}
                  <div className={`grid grid-cols-2 gap-2 p-4 bg-white rounded-md border dark:bg-transparent`}>
                    {formFields.maxUsage}
                    {formFields.remainingUsage}
                  </div>

                  <div className="grid grid-cols-1 gap-2 p-4 bg-white border rounded-md">
                    {formFields.numberOfUsagePerUser}
                  </div>

                  {/* Nhóm: Kích hoạt voucher */}
                  <div className="flex flex-col gap-4 p-4 bg-white border rounded-md dark:bg-transparent">
                    {formFields.isActive}
                    {formFields.isPrivate}
                  </div>

                  {/* Nhóm: Kiểm tra định danh */}
                  <div className="grid grid-cols-1 p-4 bg-white border rounded-md">
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
