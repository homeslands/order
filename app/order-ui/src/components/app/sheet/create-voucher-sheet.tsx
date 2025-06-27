import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
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
  DataTable,
} from '@/components/ui'
import { CreateVoucherDialog } from '@/components/app/dialog'
import { ICreateVoucherRequest } from '@/types'
import { SimpleDatePicker } from '../picker'
import { createVoucherSchema, TCreateVoucherSchema } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { VoucherTypeSelect } from '../select'
import { VOUCHER_TYPE } from '@/constants'
import { useProductColumns } from '@/app/system/voucher/DataTable/columns'
import { useCatalogs, useProducts } from '@/hooks'
import { ProductFilterOptions } from '@/app/system/dishes/DataTable/actions'

export default function CreateVoucherSheet({ onSuccess, isOpen, openChange }: { onSuccess: () => void, isOpen: boolean, openChange: (open: boolean) => void }) {
  const { slug } = useParams()
  const { t } = useTranslation(['voucher'])
  const { t: tCommon } = useTranslation(['common'])
  const [isOpenDialog, setIsOpenDialog] = useState(false)
  const [formData, setFormData] = useState<ICreateVoucherRequest | null>(null)
  const [catalog, setCatalog] = useState<string | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]) // State để lưu danh sách sản phẩm đã chọn qua tất cả các trang
  const [sheetPagination, setSheetPagination] = useState({
    pageIndex: 1,
    pageSize: 10
  })

  const { data: catalogs } = useCatalogs()

  const { data: products, isLoading } = useProducts({
    page: sheetPagination.pageIndex,
    size: sheetPagination.pageSize,
    hasPaging: true,
    catalog: catalog || undefined,
  },
    !!isOpen
  )

  const productsData = products?.result.items
  const catalogsData = catalogs?.result

  // const [sheetOpen, setSheetOpen] = useState(openChange)
  const form = useForm<TCreateVoucherSchema>({
    resolver: zodResolver(createVoucherSchema),
    defaultValues: {
      voucherGroup: slug as string,
      title: '',
      description: '',
      type: VOUCHER_TYPE.PERCENT_ORDER,
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      code: '',
      value: 0,
      isActive: false,
      isPrivate: false,
      numberOfUsagePerUser: 1,
      maxUsage: 0,
      minOrderValue: 0,
      isVerificationIdentity: true,
      products: []
    }
  })

  const handlePageSizeChange = useCallback((size: number) => {
    setSheetPagination(() => ({
      pageIndex: 1, // Reset to first page when changing page size
      pageSize: size
    }))
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setSheetPagination(prev => ({
      ...prev,
      pageIndex: page
    }))
  }, [])

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

    // Nếu thay đổi startDate, kiểm tra và cập nhật endDate nếu cần
    if (fieldName === 'startDate') {
      const currentEndDate = form.getValues('endDate')
      if (currentEndDate && new Date(currentEndDate) < new Date(date)) {
        form.setValue('endDate', date)
      }
    }
  }

  const handleSelectionChange = (selectedSlugs: string[]) => {
    setSelectedProducts(selectedSlugs) // Cập nhật state selectedProducts
    form.setValue('products', selectedSlugs)
  }

  const filterConfig = [
    {
      id: 'catalog',
      label: t('catalog.title'),
      options: [
        { label: tCommon('dataTable.all'), value: 'all' },
        ...(catalogsData?.map(catalog => ({
          label: catalog.name.charAt(0).toUpperCase() + catalog.name.slice(1),
          value: catalog.slug,
        })) || []),
      ],
    },
  ]

  const handleFilterChange = (filterId: string, value: string) => {
    if (filterId === 'catalog') {
      setCatalog(value === 'all' ? null : value)
    }
  }

  const handleSubmit = (data: ICreateVoucherRequest) => {
    setFormData(data)
    setIsOpenDialog(true)
  }

  const resetForm = () => {
    form.reset({
      voucherGroup: slug as string,
      title: '',
      description: '',
      type: VOUCHER_TYPE.PERCENT_ORDER,
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      code: '',
      value: 0,
      isActive: false,
      isPrivate: false,
      numberOfUsagePerUser: 1,
      maxUsage: 0,
      minOrderValue: 0,
      isVerificationIdentity: true,
      products: []
    })
    setSelectedProducts([]) // Reset danh sách sản phẩm đã chọn
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
    code: (
      <FormField
        control={form.control}
        name="code"
        render={({ field }) => (
          <FormItem>
            <FormLabel className='flex gap-1 items-center'>
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
            <FormLabel className='flex gap-1 items-center'>
              <span className="text-destructive">
                *
              </span>
              {t('voucher.value')}</FormLabel>
            <FormControl>
              {form.watch('type') === VOUCHER_TYPE.PERCENT_ORDER ? (
                <div className='relative'>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        field.onChange('');
                      } else {
                        field.onChange(Number(value));
                      }
                    }}
                    className='text-sm'
                    value={field.value === 0 ? '' : field.value}
                    min={0}
                    max={100}
                    placeholder={t('voucher.enterVoucherValue')}
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                </div>
              ) : form.watch('type') === VOUCHER_TYPE.FIXED_VALUE ? (
                <div className='relative'>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        field.onChange('');
                      } else {
                        field.onChange(Number(value));
                      }
                    }}
                    className='text-sm'
                    value={field.value === 0 ? '' : field.value}
                    placeholder={t('voucher.enterVoucherValue')}
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    ₫
                  </span>
                </div>
              ) : form.watch('type') === VOUCHER_TYPE.SAME_PRICE_PRODUCT ? (
                <div className='relative'>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        field.onChange('');
                      } else {
                        field.onChange(Number(value));
                      }
                    }}
                    className='text-sm'
                    value={field.value === 0 ? '' : field.value}
                    placeholder={t('voucher.enterFixedProductPrice')}
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    ₫
                  </span>
                </div>
              ) : null}

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
              {t('voucher.voucherMaxUsage')}</FormLabel>
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
    <Sheet open={isOpen} onOpenChange={openChange}>
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
                    {formFields.code}
                    {formFields.type}
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
                  {/* Nhóm: Sản phẩm */}
                  <div className={`grid grid-cols-1 gap-2 p-4 bg-white rounded-md border dark:bg-transparent`}>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium'>
                        {t('voucher.products')}
                      </span>
                      {selectedProducts.length > 0 && (
                        <span className='px-2 py-1 text-xs rounded-full text-muted-foreground bg-primary/10'>
                          {selectedProducts.length} sản phẩm đã chọn
                        </span>
                      )}
                    </div>
                    <DataTable
                      columns={useProductColumns({
                        onSelectionChange: handleSelectionChange,
                        selectedProducts: selectedProducts, // Truyền danh sách sản phẩm đã chọn
                      })}
                      data={productsData || []}
                      isLoading={isLoading}
                      pages={products?.result.totalPages || 1}
                      filterOptions={ProductFilterOptions}
                      onPageChange={handlePageChange}
                      onPageSizeChange={handlePageSizeChange}
                      filterConfig={filterConfig}
                      onFilterChange={handleFilterChange}
                    />
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
            {isOpenDialog && (
              <CreateVoucherDialog
                voucher={formData}
                isOpen={isOpenDialog}
                onOpenChange={setIsOpenDialog}
                onCloseSheet={() => openChange(false)}
                onSuccess={handleCreateVoucherSuccess}
              />
            )}
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
